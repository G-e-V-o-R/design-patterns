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
  type LessonIssue,
} from './model';
import { hints, label } from './lessonContent';
import type { DemoRun } from './ObserverDemo';

export function useObserverLesson(
  graph: LessonGraph,
  onChange: (graph: LessonGraph) => void,
)
{
  const [history, setHistory] = useState<LessonGraph[]>([]);
  const [issues, setIssues] = useState<LessonIssue[] | null>(null);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(-1);
  const [worked, setWorked] = useState(false);
  const [narionSubscribed, setNarionSubscribed] = useState(true);
  const [demoRun, setDemoRun] = useState<(DemoRun & { graph: LessonGraph }) | null>(null);
  const nextRunId = useRef(0);

  const issueClassIds = new Set(issues?.flatMap(issue => issue.classIds));
  const issueMemberIds = [...new Set(issues?.flatMap(issue => issue.memberIds))];
  const issueEdgeIndices = new Set(issues?.flatMap(issue => issue.edgeIndices));
  const demoReady = validateLesson(graph).length === 0;

  function edit(nextGraph: LessonGraph)
  {
    setHistory(previousHistory => [...previousHistory.slice(-29), graph]);
    onChange(nextGraph);
    setIssues(null);
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

    let resultMessage: string;
    if (ownerClassId)
    {
      resultMessage = `${memberCard.label} added to ${label(ownerClassId)}.`;
    }
    else
    {
      resultMessage = `${memberCard.label} is no longer in a class.`;
    }
    setMessage(resultMessage);
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
    setMessage(
      `Relationship added: ${label(sourceClassId)} → ${label(targetClassId)}. Check your diagram.`,
    );
  }

  function startDemo(danger: boolean)
  {
    const lessonIssues = getLessonIssues(graph);
    setIssues(lessonIssues);
    setMessage('');

    if (lessonIssues.length > 0)
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
    setIssues(null);
    setDemoRun(null);
    setMessage('Last edit undone.');
    setWorked(false);
  }

  function resetLesson()
  {
    edit(emptyLesson());
  }

  function check(runDemo = false)
  {
    if (runDemo)
    {
      startDemo(true);
      return demoReady;
    }

    setIssues(getLessonIssues(graph));
    setMessage('');
    setDemoRun(null);
    return false;
  }

  return {
    issues,
    message,
    hint,
    worked,
    narionSubscribed,
    demoRun,
    demoReady,
    issueClassIds,
    issueMemberIds,
    issueEdgeIndices,
    canUndo: history.length > 0,
    edit,
    assignMethod,
    removeClasses,
    connect,
    check,
    startDemo,
    toggleBracelet,
    showHint,
    showSolution,
    undo,
    resetLesson,
  };
}
