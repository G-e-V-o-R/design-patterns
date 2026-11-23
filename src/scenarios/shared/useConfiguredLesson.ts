import { useReducer } from 'react';
import { createDiagramRelationship, type DiagramConnection, type DiagramRelationship } from './connections';
import { useLanguage } from './language';
import {
  emptyConfiguredLesson,
  getConfiguredLessonIssues,
  type LessonGraph,
} from './configuredLessonModel';
import type { CompiledScenario } from './scenarioConfig';

type CardPositions = Record<string, { x: number; y: number }>;

type LessonLayout = {
  id: number;
  positions: CardPositions;
};

type LessonSnapshot = {
  graph: LessonGraph;
  layout: LessonLayout;
};

const editorMessages = {
  missingClass: { en: 'Add both classes to the diagram first.', ru: 'Сначала добавьте на диаграмму оба класса.' },
  sameClass: { en: 'Choose two different classes.', ru: 'Выберите два разных класса.' },
  missingType: { en: 'Choose a relationship type first.', ru: 'Сначала выберите тип связи.' },
  duplicate: { en: 'That relationship already exists.', ru: 'Такая связь уже существует.' },
};

type EditorMessage = keyof typeof editorMessages;

type EditorState = LessonSnapshot & {
  history: LessonSnapshot[];
  message: EditorMessage | null;
  fitRevision: number;
};

type EditorAction =
  | { type: 'edit'; update: (graph: LessonGraph) => LessonGraph; resetLayout?: boolean }
  | { type: 'move'; positions: CardPositions; layoutId: number }
  | { type: 'message'; message: EditorMessage }
  | { type: 'undo' };

function reduceEditor(state: EditorState, action: EditorAction): EditorState
{
  if (action.type === 'move')
  {
    if (action.layoutId !== state.layout.id)
    {
      return state;
    }
    return {
      ...state,
      layout: { ...state.layout, positions: { ...state.layout.positions, ...action.positions } },
    };
  }
  if (action.type === 'message')
  {
    return { ...state, message: action.message };
  }
  if (action.type === 'undo')
  {
    const previous = state.history.at(-1);
    if (!previous)
    {
      return state;
    }
    const sameLayout = previous.layout.id === state.layout.id;
    return {
      ...state,
      ...previous,
      layout: sameLayout ? state.layout : previous.layout,
      fitRevision: state.fitRevision + (sameLayout ? 0 : 1),
      history: state.history.slice(0, -1),
      message: null,
    };
  }

  const graph = action.update(state.graph);
  if (graph === state.graph)
  {
    return state;
  }
  const fitRevision = state.fitRevision + (action.resetLayout ? 1 : 0);
  const layout = action.resetLayout
    ? { id: fitRevision, positions: {} }
    : state.layout;
  const snapshot = { graph: state.graph, layout: state.layout };
  return {
    ...state,
    graph,
    layout,
    fitRevision,
    history: [...state.history.slice(-29), snapshot],
    message: null,
  };
}

export function useConfiguredLesson(config: CompiledScenario)
{
  const language = useLanguage();
  const [state, dispatch] = useReducer(reduceEditor, undefined, (): EditorState => ({
    graph: emptyConfiguredLesson(),
    layout: { id: 0, positions: {} },
    history: [],
    message: null,
    fitRevision: 0,
  }));
  const issues = getConfiguredLessonIssues(config, state.graph, language);

  function edit(update: (graph: LessonGraph) => LessonGraph)
  {
    dispatch({ type: 'edit', update });
  }

  function addClass(id: string)
  {
    if (!config.classes.some(card => card.id === id))
    {
      return;
    }
    edit(graph =>
    {
      if (graph.classes.includes(id))
      {
        return graph;
      }
      return { ...graph, classes: [...graph.classes, id] };
    });
  }

  function removeClasses(ids: string[])
  {
    edit(graph => ({
      classes: graph.classes.filter(id => !ids.includes(id)),
      members: Object.fromEntries(Object.entries(graph.members).filter(([, owner]) => !ids.includes(owner))),
      edges: graph.edges.filter(edge => !ids.includes(edge.source) && !ids.includes(edge.target)),
    }));
  }

  function assign(memberId: string, owner: string)
  {
    if (!config.members.some(member => member.id === memberId))
    {
      return;
    }
    edit(graph =>
    {
      if ((owner && !graph.classes.includes(owner)) || (graph.members[memberId] ?? '') === owner)
      {
        return graph;
      }
      const members = { ...graph.members };
      if (owner)
      {
        members[memberId] = owner;
      }
      else
      {
        delete members[memberId];
      }
      return { ...graph, members };
    });
  }

  function saveRelationship(connection: DiagramConnection, type: string, previous?: DiagramRelationship)
  {
    if (!state.graph.classes.includes(connection.source) || !state.graph.classes.includes(connection.target))
    {
      dispatch({ type: 'message', message: 'missingClass' });
      return;
    }
    if (connection.source === connection.target)
    {
      dispatch({ type: 'message', message: 'sameClass' });
      return;
    }
    if (!config.relationships.some(relationship => relationship.id === type))
    {
      dispatch({ type: 'message', message: 'missingType' });
      return;
    }
    const relationship = createDiagramRelationship(connection, type);
    if (state.graph.edges.some(edge => edge !== previous && edge.source === relationship.source
      && edge.target === relationship.target && edge.type === type))
    {
      dispatch({ type: 'message', message: 'duplicate' });
      return;
    }
    if (!previous)
    {
      edit(graph => ({ ...graph, edges: [...graph.edges, relationship] }));
      return;
    }

    const current = createDiagramRelationship(previous, previous.type);
    if (current.source === relationship.source && current.target === relationship.target
      && current.sourceHandle === relationship.sourceHandle && current.targetHandle === relationship.targetHandle)
    {
      return;
    }
    edit(graph =>
    {
      if (!graph.edges.includes(previous))
      {
        return graph;
      }
      return { ...graph, edges: graph.edges.map(edge => edge === previous ? relationship : edge) };
    });
  }

  function connect(connection: DiagramConnection, type: string)
  {
    saveRelationship(connection, type);
  }

  function reconnect(index: number, connection: DiagramConnection)
  {
    const previous = state.graph.edges[index];
    if (previous)
    {
      saveRelationship(connection, previous.type, previous);
    }
  }

  function removeEdges(indices: number[])
  {
    const removed = new Set(indices.map(index => state.graph.edges[index]));
    edit(graph =>
    {
      const edges = graph.edges.filter(edge => !removed.has(edge));
      if (edges.length === graph.edges.length)
      {
        return graph;
      }
      return { ...graph, edges };
    });
  }

  return {
    ...state,
    message: state.message ? editorMessages[state.message][language] : '',
    issues,
    ready: issues.length === 0,
    canUndo: state.history.length > 0,
    addClass,
    removeClasses,
    assign,
    connect,
    reconnect,
    removeEdges,
    moveClasses: (positions: CardPositions) => dispatch({ type: 'move', positions, layoutId: state.layout.id }),
    undo: () => dispatch({ type: 'undo' }),
    reset: () => dispatch({ type: 'edit', update: emptyConfiguredLesson, resetLayout: true }),
  };
}

export type ConfiguredLessonEditor = ReturnType<typeof useConfiguredLesson>;
