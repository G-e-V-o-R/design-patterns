import { useState, type DragEvent } from 'react';
import { applyNodeChanges, MarkerType, type Connection, type Edge, type NodeChange } from '@xyflow/react';
import { classCards, memberCards, relationshipKinds, type MediatorGraph } from './model';
import { MediatorActions } from './MediatorActions';
import { MediatorConcept, MediatorIntro } from './MediatorIntro';
import { MediatorDemo } from './MediatorDemo';
import { MediatorDiagram } from './MediatorDiagram';
import { MediatorRelations } from './MediatorRelations';
import { MediatorTray } from './MediatorTray';
import { classArtwork, mediatorDragType, positions } from './lessonContent';
import { useMediatorLesson } from './useMediatorLesson';
import type { ClassNode } from './DiagramClass';
import './mediator.css';

export function MediatorLesson({ graph, onChange, active = true }: { graph: MediatorGraph; onChange: (graph: MediatorGraph) => void; active?: boolean }) {
  const {
    issues, message, hint, worked, result, ready,
    issueClassIds, issueMemberIds, issueEdgeIndices, canUndo,
    edit, assign, removeClasses, connect, run, check, showHint, showSolution, undo, resetLesson,
  } = useMediatorLesson(graph, onChange);
  const [tab, setTab] = useState<'classes' | 'members'>('classes');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [relationship, setRelationship] = useState('uses');
  const [nodeState, setNodeState] = useState<Record<string, Partial<ClassNode>>>({});
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  function startDrag(event: DragEvent, id: string) {
    event.dataTransfer.setData(mediatorDragType, id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedMember(id);
  }
  function endDrag() {
    setDraggedMember(null);
    setDropTarget(null);
  }
  function handleReset() {
    resetLesson();
    setNodeState({});
    setSource('');
    setTarget('');
  }
  function removeEdge(index: number) {
    edit({...graph, edges: graph.edges.filter((_, i) => i !== index)});
  }
  const nodes: ClassNode[] = classCards.filter(card => graph.classes.includes(card.id)).map(card => ({
    id: card.id,
    type: 'mediatorClass',
    position: positions[card.id]!,
    ...nodeState[card.id],
    data: {
      ...card,
      members: memberCards.filter(member => graph.members[member.id] === card.id),
      needsFix: issueClassIds.has(card.id),
      issueMembers: issueMemberIds,
      isDropTarget: dropTarget === card.id,
      artwork: classArtwork[card.id],
      onRemove: () => removeClasses([card.id]),
      onAssign: id => assign(id, card.id),
      onDragHover: hovered => setDropTarget(current => hovered ? card.id : current === card.id ? null : current),
    },
  }));
  const edges: Edge[] = graph.edges.map((edge, index) => ({...edge, id: String(index), type: 'smoothstep', label: relationshipKinds.find(kind => kind.id === edge.type)?.label, markerEnd: edge.type === 'implements' ? 'mediator-implements-arrow' : {type: MarkerType.ArrowClosed, color: issueEdgeIndices.has(index) ? '#f0a28e' : '#c6bb8e'}, style: {stroke: issueEdgeIndices.has(index) ? '#f0a28e' : '#a5b99e', strokeWidth: issueEdgeIndices.has(index) ? 3 : 1.6, strokeDasharray: edge.type === 'implements' ? '6 4' : undefined}}));
  function changeNodes(changes: NodeChange<ClassNode>[]) {
    const updated = applyNodeChanges(changes, nodes);
    setNodeState(Object.fromEntries(updated.map(node => [node.id, node])));
  }
  function handleNodesDelete(deleted: ClassNode[]) {
    removeClasses(deleted.map(node => node.id));
  }
  function handleEdgesDelete(deleted: Edge[]) {
    edit({...graph, edges: graph.edges.filter((_, index) => !deleted.some(edge => edge.id === String(index)))});
  }
  function handleConnect(connection: Connection) {
    connect(connection.source, connection.target, relationship);
  }
  return <section className="mediator-lesson" aria-labelledby="mediator-heading" onDragEnd={endDrag}>
    <MediatorIntro/>
    <div className="med-workspace"><MediatorTray graph={graph} tab={tab} onTabChange={setTab} draggedMember={draggedMember} issueClassIds={issueClassIds} issueMemberIds={issueMemberIds} hint={hint} onAddClass={id => edit({...graph, classes:[...graph.classes, id]})} onAssign={assign} onStartDrag={startDrag} onDragEnd={endDrag} onShowHint={showHint} onShowSolution={showSolution}/>
      <div className="med-board"><header className="med-board-heading"><div><h2>Your class diagram</h2><p>{Object.keys(graph.members).length}/{memberCards.length} members · {graph.edges.length} relationships</p></div><div className="med-actions"><button disabled={!canUndo} onClick={undo}>Undo</button><button onClick={handleReset}>Reset</button></div></header>
        {worked && <p className="med-worked">Example solution · follow how each participant uses the mediator.</p>}
        <MediatorDiagram nodes={nodes} edges={edges} classKey={graph.classes.join(',')} active={active} onNodesChange={changeNodes} onNodesDelete={handleNodesDelete} onEdgesDelete={handleEdgesDelete} onConnect={handleConnect}/>
        <MediatorRelations graph={graph} source={source} target={target} relationship={relationship} issueEdgeIndices={issueEdgeIndices} onSourceChange={setSource} onTargetChange={setTarget} onRelationshipChange={setRelationship} onConnect={() => connect(source, target, relationship)} onRemoveEdge={removeEdge}/>
        <MediatorActions onCheck={check} message={message} issues={issues}/>
        <MediatorDemo ready={ready} result={result} onRun={run}/>
      </div></div>
    <MediatorConcept/>
  </section>;
}
