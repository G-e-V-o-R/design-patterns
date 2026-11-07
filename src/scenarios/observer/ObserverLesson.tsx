import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { applyNodeChanges, MarkerType, type Connection, type Edge, type NodeChange } from '@xyflow/react';
import { classCards, memberCards, normalizeConnectionHandle, relationshipKinds, type LessonGraph } from './model';
import { ObserverActions } from './ObserverActions';
import { ObserverConcept, ObserverIntro } from './ObserverIntro';
import { ObserverDemo } from './ObserverDemo';
import { ObserverDiagram } from './ObserverDiagram';
import { ObserverRelations } from './ObserverRelations';
import { ObserverTray } from './ObserverTray';
import { classArtwork, methodDragType, positions } from './lessonContent';
import { useObserverLesson } from './useObserverLesson';
import type { ClassNode } from './DiagramClass';
import './observer.css';

export function ObserverLesson({ graph, onChange, active = true }: { graph: LessonGraph; onChange: (graph: LessonGraph) => void; active?: boolean }) {
  const {
    issues, message, hint, worked, narionSubscribed, demoRun, demoReady,
    issueClassIds, issueMemberIds, issueEdgeIndices, canUndo,
    edit, assignMethod, removeClasses, connect, check, startDemo, toggleBracelet, showHint, showSolution, undo, resetLesson,
  } = useObserverLesson(graph, onChange);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [draggedMethod, setDraggedMethod] = useState<string | null>(null);
  const [tab, setTab] = useState<'classes'|'fields'|'methods'>('classes');
  const [relationship, setRelationship] = useState('stores');
  const [drawing, setDrawing] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const portConnectionSource = useRef<string | null>(null);
  const [nodeState, setNodeState] = useState<Record<string, Partial<ClassNode>>>({});
  const demoContainer = useRef<HTMLDivElement>(null);
  function selectRelationship(type: string) {
    setRelationship(type);
    setConnectionSource(null);
    setDrawing(true);
  }
  useEffect(() => {
    function cancel(event: KeyboardEvent) {
      if (event.key === 'Escape') { setConnectionSource(null); setDrawing(false); }
    }
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, []);
  useEffect(() => { setConnectionSource(null); }, [graph]);
  function endMethodDrag() { setDropTarget(null); setDraggedMethod(null); }
  function startMethodDrag(event: DragEvent, id: string) {
    event.stopPropagation();
    event.dataTransfer.setData(methodDragType, id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedMethod(id);
  }
  function isEmptyCanvasDrop(event: DragEvent) {
    return event.dataTransfer.types.includes(methodDragType) && event.target instanceof Element && event.target.matches('.react-flow__pane');
  }
  const nodes: ClassNode[] = classCards.filter(card => graph.classes.includes(card.id)).map(card => ({ id: card.id, type: 'lessonClass', position: positions[card.id]!, ...nodeState[card.id], className: connectionSource === card.id ? 'lesson-connection-source' : '', data: { ...card, needsFix: issueClassIds.has(card.id), issueMemberIds, draggedMethod, onStartMethodDrag: startMethodDrag, onEndMethodDrag: endMethodDrag, isDropTarget: dropTarget === card.id, onDragHover: hovered => setDropTarget(current => hovered ? card.id : current === card.id ? null : current), onDropMethod: id => assignMethod(id, card.id), artwork: classArtwork[card.id], members: memberCards.filter(member => graph.members[member.id] === card.id), onRemove: () => removeClasses([card.id]) } }));
  const edges: Edge[] = graph.edges.map((edge, index) => ({ ...edge, sourceHandle: normalizeConnectionHandle(edge.sourceHandle) ?? 'bottom', targetHandle: normalizeConnectionHandle(edge.targetHandle) ?? 'top', id: String(index), type: 'smoothstep', className: issueEdgeIndices.has(index) ? 'lesson-edge-error' : '', label: relationshipKinds.find(kind => kind.id === edge.type)?.label, markerEnd: edge.type === 'implements' ? 'lesson-implements-arrow' : {type: MarkerType.ArrowClosed, color:'#b6c9b1'}, style: {stroke:issueEdgeIndices.has(index) ? '#f0a28e' : '#a7bba4', strokeWidth:issueEdgeIndices.has(index) ? 3 : 1.6, strokeDasharray: edge.type === 'implements' ? '6 4' : undefined} }));
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
    // React Flow assigns endpoints by handle role, even when dragging from a target.
    const reverse = portConnectionSource.current === connection.target;
    connect(reverse ? connection.target : connection.source, reverse ? connection.source : connection.target, relationship, reverse ? connection.targetHandle : connection.sourceHandle, reverse ? connection.sourceHandle : connection.targetHandle);
    portConnectionSource.current = null;
    setConnectionSource(null);
  }
  function handleConnectStart(nodeId: string | null) { portConnectionSource.current = nodeId; }
  function handleConnectEnd() { portConnectionSource.current = null; }
  function handleNodeClick(event: MouseEvent, node: ClassNode) {
    if (!drawing || (event.target instanceof Element && event.target.closest('button, .lesson-assigned-method, .react-flow__handle'))) return;
    if (!connectionSource) setConnectionSource(node.id);
    else { connect(connectionSource, node.id, relationship); setConnectionSource(null); }
  }
  function handleCheck(run = false) {
    const ready = check(run);
    if (run && ready) demoContainer.current?.scrollIntoView({ block: 'nearest' });
  }
  function handleReset() {
    resetLesson();
    setNodeState({});
  }
  function removeEdge(index: number) {
    edit({...graph, edges: graph.edges.filter((_, i) => i !== index)});
  }
  return <section className="observer-lesson" onDragEnd={endMethodDrag}>
    <ObserverIntro/>
    <div className="lesson-workspace"><ObserverTray graph={graph} tab={tab} onTabChange={setTab} draggedMethod={draggedMethod} issueClassIds={issueClassIds} issueMemberIds={issueMemberIds} hint={hint} onAddClass={id => edit({...graph, classes:[...graph.classes, id]})} onStartMethodDrag={startMethodDrag} onShowHint={showHint} onShowSolution={showSolution}/>
      <div className="lesson-board"><div className="lesson-board-toolbar"><div><h2>Your class diagram</h2><p>{Object.keys(graph.members).length}/{memberCards.length} member cards placed · {graph.edges.length} relationships</p></div><div><button disabled={!canUndo} onClick={undo}>Undo</button><button onClick={handleReset}>Reset</button></div></div>
        {worked && <div className="lesson-worked">Example solution · see what each class does.</div>}
        <ObserverDiagram nodes={nodes} edges={edges} classKey={graph.classes.join(',')} active={active} drawing={drawing} relationship={relationship} connectionSource={connectionSource} onNodesChange={changeNodes} onNodesDelete={handleNodesDelete} onEdgesDelete={handleEdgesDelete} onConnect={handleConnect} onConnectStart={handleConnectStart} onConnectEnd={handleConnectEnd} onNodeClick={handleNodeClick} onPaneClick={() => setConnectionSource(null)} onSelectRelationship={selectRelationship} onMoveMode={() => { setDrawing(false); setConnectionSource(null); }} onDragOver={event => {
          if (!isEmptyCanvasDrop(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          setDropTarget(null);
        }} onDrop={event => {
          if (!isEmptyCanvasDrop(event)) return;
          event.preventDefault();
          assignMethod(event.dataTransfer.getData(methodDragType), '');
          endMethodDrag();
        }}/>
        <ObserverRelations edges={graph.edges} issueEdgeIndices={issueEdgeIndices} onRemoveEdge={removeEdge}/>
        <ObserverActions onCheck={() => handleCheck()} onRun={() => handleCheck(true)} message={message} issues={issues} worked={worked}/>
        <div ref={demoContainer}><ObserverDemo ready={demoReady} narionSubscribed={narionSubscribed} onToggleBracelet={toggleBracelet} onRun={startDemo} run={demoRun?.graph === graph ? demoRun : null}/></div>
      </div></div>
    <ObserverConcept/>
  </section>;
}
