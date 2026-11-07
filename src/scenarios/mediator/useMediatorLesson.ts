import { useState } from 'react';
import { classLabel, emptyLesson, getLessonIssues, hints, memberCards, solutionLesson, simulateLesson, type CoordinationResult, type MediatorGraph, type MediatorIssue, type RequestKind } from './model';

export function useMediatorLesson(graph: MediatorGraph, onChange: (graph: MediatorGraph) => void) {
  const [history, setHistory] = useState<MediatorGraph[]>([]);
  const [issues, setIssues] = useState<MediatorIssue[] | null>(null);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(-1);
  const [worked, setWorked] = useState(false);
  const [result, setResult] = useState<CoordinationResult | null>(null);
  const issueClassIds = new Set(issues?.flatMap(issue => issue.classIds));
  const issueMemberIds = new Set(issues?.flatMap(issue => issue.memberIds));
  const issueEdgeIndices = new Set(issues?.flatMap(issue => issue.edgeIndices));
  const ready = getLessonIssues(graph).length === 0;

  function edit(next: MediatorGraph) {
    setHistory(items => [...items.slice(-29), graph]);
    onChange(next);
    setIssues(null);
    setResult(null);
    setMessage('');
    setWorked(false);
  }
  function assign(memberId: string, owner: string) {
    if (!memberCards.some(member => member.id === memberId) || (owner && !graph.classes.includes(owner))) return;
    if ((graph.members[memberId] ?? '') === owner) return;
    const members = {...graph.members};
    if (owner) members[memberId] = owner; else delete members[memberId];
    edit({...graph, members});
    setMessage(owner ? `Member assigned to ${classLabel(owner)}.` : 'Member returned to the tray.');
  }
  function removeClasses(ids: string[]) {
    edit({
      classes: graph.classes.filter(id => !ids.includes(id)),
      members: Object.fromEntries(Object.entries(graph.members).filter(([, owner]) => !ids.includes(owner))),
      edges: graph.edges.filter(edge => !ids.includes(edge.source) && !ids.includes(edge.target)),
    });
  }
  function connect(from: string, to: string, type: string) {
    if (!graph.classes.includes(from) || !graph.classes.includes(to)) { setMessage('Choose two classes already in the diagram.'); return; }
    if (from === to) { setMessage('Choose two different classes.'); return; }
    const edge = { source: from, target: to, type };
    if (graph.edges.some(existing => existing.source === edge.source && existing.type === edge.type && existing.target === edge.target)) { setMessage('That relationship already exists.'); return; }
    edit({...graph, edges: [...graph.edges, edge]});
    setMessage(`Connected ${classLabel(from)} to ${classLabel(to)}. Check the diagram to test your choice.`);
  }
  function run(request: RequestKind) {
    setIssues(getLessonIssues(graph));
    setMessage('');
    setResult(simulateLesson(graph, request));
  }
  function check() {
    setIssues(getLessonIssues(graph));
    setMessage('');
    setResult(null);
  }
  function showHint() {
    setHint(value => Math.min(value + 1, hints.length - 1));
  }
  function showSolution() {
    edit(solutionLesson());
    setWorked(true);
    setMessage('Example ready. Try both requests below the diagram.');
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    onChange(previous);
    setHistory(history.slice(0, -1));
    setIssues(null);
    setResult(null);
    setWorked(false);
    setMessage('Last edit undone.');
  }
  function resetLesson() {
    edit(emptyLesson());
  }

  return {
    issues, message, hint, worked, result, ready,
    issueClassIds, issueMemberIds, issueEdgeIndices, canUndo: history.length > 0,
    edit, assign, removeClasses, connect, run, check, showHint, showSolution, undo, resetLesson,
  };
}
