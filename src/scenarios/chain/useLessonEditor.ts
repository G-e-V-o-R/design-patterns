import { useState } from 'react';
import {
  classCards,
  classLabel,
  getLessonIssues,
  hints,
  memberCards,
  simulateLesson,
  solutionLesson,
  type ChainGraph,
  type RequestKind,
} from './model';

export function useChainLesson(
  graph: ChainGraph,
  onChange: (graph: ChainGraph) => void,
)
{
  const [history, setHistory] = useState<ChainGraph[]>([]);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(-1);
  const [worked, setWorked] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof simulateLesson> | null>(null);

  const ready = getLessonIssues(graph).length === 0;

  function edit(nextGraph: ChainGraph)
  {
    setHistory(previousHistory => [...previousHistory.slice(-29), graph]);
    onChange(nextGraph);
    setResult(null);
    setMessage('');
    setWorked(false);
  }

  function assign(memberId: string, owner: string)
  {
    const memberExists = classCards.some(card => card.id === memberId) || memberCards.some(card => card.id === memberId);
    if (!memberExists || (owner && !graph.classes.includes(owner)))
    {
      return;
    }

    if ((graph.members[memberId] ?? '') === owner)
    {
      return;
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

    edit({ ...graph, members });
    setMessage(
      owner
        ? `Member assigned to ${classLabel(owner)}.`
        : 'Member returned to the tray.',
    );
  }

  function removeClasses(classIds: string[])
  {
    edit({
      classes: graph.classes.filter(id => !classIds.includes(id)),
      members: Object.fromEntries(
        Object.entries(graph.members).filter(([, owner]) => !classIds.includes(owner)),
      ),
      edges: graph.edges.filter(edge => !classIds.includes(edge.source) && !classIds.includes(edge.target)),
    });
  }

  function connect(from: string, to: string, type: string)
  {
    if (!graph.classes.includes(from) || !graph.classes.includes(to))
    {
      setMessage('Choose two classes already in the diagram.');
      return;
    }

    if (from === to)
    {
      setMessage('Choose two different classes.');
      return;
    }

    const edge = { source: from, target: to, type };
    const relationshipExists = graph.edges.some(existing =>
      existing.source === edge.source
      && existing.type === edge.type
      && existing.target === edge.target,
    );

    if (relationshipExists)
    {
      setMessage('That relationship already exists.');
      return;
    }

    edit({ ...graph, edges: [...graph.edges, edge] });
    setMessage(`Connected ${classLabel(from)} to ${classLabel(to)}.`);
  }

  function run(request: RequestKind)
  {
    setMessage('');
    setResult(simulateLesson(graph, request));
  }

  function showHint()
  {
    setHint(value => Math.min(value + 1, hints.length - 1));
  }

  function showSolution()
  {
    edit(solutionLesson());
    setWorked(true);
    setMessage('Example ready. Try each request below the diagram.');
  }

  function undo()
  {
    const previousGraph = history.at(-1);
    if (!previousGraph)
    {
      return;
    }

    onChange(previousGraph);
    setHistory(history.slice(0, -1));
    setResult(null);
    setWorked(false);
    setMessage('Last edit undone.');
  }

  function resetLesson()
  {
    edit({ classes: [], members: {}, edges: [] });
  }

  return {
    message,
    hint,
    worked,
    result,
    ready,
    canUndo: history.length > 0,
    edit,
    assign,
    removeClasses,
    connect,
    run,
    showHint,
    showSolution,
    undo,
    resetLesson,
  };
}
