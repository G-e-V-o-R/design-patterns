import { useRef, useState } from 'react';
import {
  discoverPath,
  emptyLesson,
  getLessonIssues,
  isConnectionHandle,
  memberCards,
  solutionLesson,
  validateLesson,
  type ConnectionHandle,
  type LessonGraph,
} from './model';
import { hints, label } from './lessonContent';
import type { DemoRun } from './NotificationDemo';

export function useObserverLesson(
  graph: LessonGraph,
  onChange: (graph: LessonGraph) => void,
)
{
  const [history, setHistory] = useState<LessonGraph[]>([]);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(-1);
  const [worked, setWorked] = useState(false);
  const [narionSubscribed, setNarionSubscribed] = useState(true);
  const [demoRun, setDemoRun] = useState<(DemoRun & { graph: LessonGraph }) | null>(null);
  const nextRunId = useRef(0);

  const demoReady = validateLesson(graph).length === 0;

  function edit(nextGraph: LessonGraph)
  {
    setHistory(previousHistory => [...previousHistory.slice(-29), graph]);
    onChange(nextGraph);
    setDemoRun(null);
    setMessage('');
    setWorked(false);
  }

  function assignMethod(memberId: string, ownerClassId: string)
  {
    const memberCard = memberCards.find(card => card.id === memberId);
    if (!memberCard)
    {
      return;
    }

    if (ownerClassId && !graph.classes.includes(ownerClassId))
    {
      return;
    }

    const currentOwner = graph.members[memberId] || '';
    if (currentOwner === ownerClassId)
    {
      return;
    }

    const updatedMembers = { ...graph.members };
    if (ownerClassId)
    {
      updatedMembers[memberId] = ownerClassId;
    }
    else
    {
      delete updatedMembers[memberId];
    }

    edit({ ...graph, members: updatedMembers });
  }

  function removeClasses(classIdsToRemove: string[])
  {
    const remainingClasses = graph.classes.filter(classId =>
      !classIdsToRemove.includes(classId));
    const remainingMembers = Object.fromEntries(
      Object.entries(graph.members).filter(([, ownerClassId]) =>
        !classIdsToRemove.includes(ownerClassId)),
    );
    const remainingEdges = graph.edges.filter(edge =>
      !classIdsToRemove.includes(edge.source)
      && !classIdsToRemove.includes(edge.target));

    edit({
      classes: remainingClasses,
      members: remainingMembers,
      edges: remainingEdges,
    });
  }

  function connect(
    sourceClassId: string,
    targetClassId: string,
    relationshipType: string,
    sourceHandle?: string | null,
    targetHandle?: string | null,
  )
  {
    if (
      !graph.classes.includes(sourceClassId)
      || !graph.classes.includes(targetClassId)
    )
    {
      setMessage('Add both class cards to the diagram first.');
      return;
    }

    if (sourceClassId === targetClassId)
    {
      setMessage('Choose two different class cards.');
      return;
    }

    const relationshipAlreadyExists = graph.edges.some(edge =>
      edge.source === sourceClassId
      && edge.target === targetClassId
      && edge.type === relationshipType);
    if (relationshipAlreadyExists)
    {
      setMessage('That relationship is already in the diagram.');
      return;
    }

    let sourceConnectionHandle: ConnectionHandle = 'bottom';
    if (isConnectionHandle(sourceHandle))
    {
      sourceConnectionHandle = sourceHandle;
    }

    let targetConnectionHandle: ConnectionHandle = 'top';
    if (isConnectionHandle(targetHandle))
    {
      targetConnectionHandle = targetHandle;
    }

    edit({
      ...graph,
      edges: [
        ...graph.edges,
        {
          source: sourceClassId,
          target: targetClassId,
          type: relationshipType,
          sourceHandle: sourceConnectionHandle,
          targetHandle: targetConnectionHandle,
        },
      ],
    });
    setMessage(`Relationship added: ${label(sourceClassId)} → ${label(targetClassId)}.`);
  }

  function startDemo(danger: boolean)
  {
    setMessage('');

    if (getLessonIssues(graph).length > 0)
    {
      setDemoRun(null);
      return;
    }

    setDemoRun({
      id: ++nextRunId.current,
      graph,
      result: discoverPath({ danger, narionSubscribed }),
    });
  }

  function toggleBracelet()
  {
    setNarionSubscribed(isSubscribed => !isSubscribed);
    setDemoRun(null);
  }

  function showHint()
  {
    setHint(currentHint => Math.min(currentHint + 1, hints.length - 1));
  }

  function showSolution()
  {
    edit(solutionLesson());
    setWorked(true);
    setMessage(
      'The solution is ready. Look at the fields, methods, and relationships. Then click Run discovery.',
    );
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
    setDemoRun(null);
    setMessage('Last edit undone.');
    setWorked(false);
  }

  function resetLesson()
  {
    edit(emptyLesson());
  }

  return {
    message,
    hint,
    worked,
    narionSubscribed,
    demoRun,
    demoReady,
    canUndo: history.length > 0,
    edit,
    assignMethod,
    removeClasses,
    connect,
    startDemo,
    toggleBracelet,
    showHint,
    showSolution,
    undo,
    resetLesson,
  };
}
