import { useReducer } from 'react';
import { createDiagramRelationship, type DiagramConnection } from './connections';
import {
  emptyConfiguredLesson,
  getConfiguredLessonIssues,
  solutionConfiguredLesson,
  type LessonGraph,
} from './configuredLessonModel';
import type { CompiledScenario } from './scenarioConfig';

type EditorState = {
  graph: LessonGraph;
  history: LessonGraph[];
  message: string;
  hint: number;
  worked: boolean;
};

type EditorAction =
  | { type: 'edit'; update: (graph: LessonGraph) => LessonGraph; message?: string; worked?: boolean }
  | { type: 'message'; message: string }
  | { type: 'hint'; count: number }
  | { type: 'undo' };

function reduceEditor(state: EditorState, action: EditorAction): EditorState
{
  if (action.type === 'message')
  {
    return { ...state, message: action.message };
  }
  if (action.type === 'hint')
  {
    return { ...state, hint: Math.min(state.hint + 1, action.count - 1) };
  }
  if (action.type === 'undo')
  {
    const previous = state.history.at(-1);
    if (!previous)
    {
      return state;
    }
    return { ...state, graph: previous, history: state.history.slice(0, -1), message: 'Last edit undone.', worked: false };
  }

  const graph = action.update(state.graph);
  if (graph === state.graph)
  {
    return state;
  }
  return {
    ...state,
    graph,
    history: [...state.history.slice(-29), state.graph],
    message: action.message ?? '',
    worked: action.worked ?? false,
  };
}

export function useConfiguredLesson(config: CompiledScenario)
{
  const [state, dispatch] = useReducer(reduceEditor, undefined, (): EditorState => ({
    graph: emptyConfiguredLesson(),
    history: [],
    message: '',
    hint: -1,
    worked: false,
  }));
  const issues = getConfiguredLessonIssues(config, state.graph);

  function edit(update: (graph: LessonGraph) => LessonGraph, message = '')
  {
    dispatch({ type: 'edit', update, message });
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

  function connect(connection: DiagramConnection, type: string)
  {
    if (!state.graph.classes.includes(connection.source) || !state.graph.classes.includes(connection.target))
    {
      dispatch({ type: 'message', message: 'Add both classes to the diagram first.' });
      return;
    }
    if (connection.source === connection.target)
    {
      dispatch({ type: 'message', message: 'Choose two different classes.' });
      return;
    }
    if (!config.relationships.some(relationship => relationship.id === type))
    {
      dispatch({ type: 'message', message: 'Choose a relationship type first.' });
      return;
    }
    const relationship = createDiagramRelationship(connection, type);
    if (state.graph.edges.some(edge => edge.source === relationship.source
      && edge.target === relationship.target && edge.type === type))
    {
      dispatch({ type: 'message', message: 'That relationship already exists.' });
      return;
    }
    edit(graph => ({ ...graph, edges: [...graph.edges, relationship] }), 'Relationship added.');
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

  function showSolution()
  {
    dispatch({ type: 'edit', update: () => solutionConfiguredLesson(config), worked: true, message: 'Example solution loaded.' });
  }

  return {
    ...state,
    issues,
    ready: issues.length === 0,
    canUndo: state.history.length > 0,
    addClass,
    removeClasses,
    assign,
    connect,
    removeEdges,
    showSolution,
    showHint: () => dispatch({ type: 'hint', count: config.hints.length }),
    undo: () => dispatch({ type: 'undo' }),
    reset: () => edit(() => emptyConfiguredLesson()),
  };
}

export type ConfiguredLessonEditor = ReturnType<typeof useConfiguredLesson>;
