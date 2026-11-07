import { useRef, useState } from 'react';
import { discoverPath, emptyLesson, getLessonIssues, isConnectionHandle, memberCards, solutionLesson, validateLesson, type LessonGraph, type LessonIssue } from './model';
import { hints, label } from './lessonContent';
import type { DemoRun } from './ObserverDemo';

export function useObserverLesson(graph: LessonGraph, onChange: (graph: LessonGraph) => void) {
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

  function edit(next: LessonGraph) { setHistory(items => [...items.slice(-29), graph]); onChange(next); setIssues(null); setDemoRun(null); setMessage(''); setWorked(false); }
  function assignMethod(id: string, owner: string) {
    const member = memberCards.find(card => card.id === id);
    if (!member || (owner && !graph.classes.includes(owner)) || (graph.members[id] || '') === owner) return;
    const members = {...graph.members};
    if (owner) members[id] = owner;
    else delete members[id];
    edit({...graph, members});
    setMessage(owner ? `${member.label} added to ${label(owner)}.` : `${member.label} is no longer in a class.`);
  }
  function removeClasses(ids: string[]) {
    edit({ classes: graph.classes.filter(id => !ids.includes(id)), members: Object.fromEntries(Object.entries(graph.members).filter(([, owner]) => !ids.includes(owner))), edges: graph.edges.filter(edge => !ids.includes(edge.source) && !ids.includes(edge.target)) });
  }
  function connect(from: string, to: string, type: string, sourceHandle?: string | null, targetHandle?: string | null) {
    if (!graph.classes.includes(from) || !graph.classes.includes(to)) { setMessage('Add both class cards to the diagram first.'); return; }
    if (from === to) { setMessage('Choose two different class cards.'); return; }
    if (graph.edges.some(e => e.source === from && e.target === to && e.type === type)) { setMessage('That relationship is already in the diagram.'); return; }
    edit({...graph, edges: [...graph.edges, { source: from, target: to, type, sourceHandle: isConnectionHandle(sourceHandle) ? sourceHandle : 'bottom', targetHandle: isConnectionHandle(targetHandle) ? targetHandle : 'top' }]});
    setMessage(`Relationship added: ${label(from)} → ${label(to)}. Check your diagram.`);
  }
  function startDemo(danger: boolean) {
    const errors = getLessonIssues(graph);
    setIssues(errors);
    setMessage('');
    setDemoRun(errors.length ? null : { id: ++nextRunId.current, graph, result: discoverPath({ danger, narionSubscribed }) });
  }
  function toggleBracelet() {
    setNarionSubscribed(value => !value);
    setDemoRun(null);
  }
  function showHint() { setHint(value => Math.min(value + 1, hints.length - 1)); }
  function showSolution() {
    edit(solutionLesson());
    setWorked(true);
    setMessage('The solution is ready. Look at the fields, methods, and relationships. Then click Run discovery.');
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    onChange(previous);
    setHistory(history.slice(0, -1));
    setIssues(null);
    setDemoRun(null);
    setMessage('Last edit undone.');
    setWorked(false);
  }
  function resetLesson() { edit(emptyLesson()); }
  function check(run = false) {
    if (run) {
      startDemo(true);
      return demoReady;
    }
    setIssues(getLessonIssues(graph));
    setMessage('');
    setDemoRun(null);
    return false;
  }

  return {
    issues, message, hint, worked, narionSubscribed, demoRun, demoReady,
    issueClassIds, issueMemberIds, issueEdgeIndices, canUndo: history.length > 0,
    edit, assignMethod, removeClasses, connect, check, startDemo, toggleBracelet, showHint, showSolution, undo, resetLesson,
  };
}
