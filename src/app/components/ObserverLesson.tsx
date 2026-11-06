import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ReactFlow, Background, Controls, Panel, Handle, Position, MarkerType, ConnectionMode, applyNodeChanges, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { connectionHandles, isConnectionHandle, normalizeConnectionHandle, classCards, memberCards, relationshipKinds, emptyLesson, solutionLesson, validateLesson, simulateLesson, type LessonGraph } from '../../application/observer-lesson';
import foxArt from '../../../docs/hobbit/scenarios/1.1.png?url';
import foxCard from '../../../docs/hobbit/UML/1.8.png?url';
import narionCard from '../../../docs/hobbit/UML/1.5.png?url';
import dreKaarCard from '../../../docs/hobbit/UML/1.1.png?url';

const classArtwork: Record<string, { src: string; alt: string }> = {
  publisher: { src: foxCard, alt: 'Fox — the publisher' },
  narion: { src: narionCard, alt: 'Narion — a concrete subscriber' },
  'dre-kaar': { src: dreKaarCard, alt: 'Dre’Kaar — a concrete subscriber' },
};
const methodDragType = 'application/x-observer-method';
type ClassNode = Node<{ draggedMethod: string | null; onStartMethodDrag: (event: DragEvent, id: string) => void; onEndMethodDrag: () => void; isDropTarget: boolean; onDropMethod: (id: string) => void; onDragHover: (hovered: boolean) => void; label: string; kind: string; members: typeof memberCards; artwork?: { src: string; alt: string }; onRemove: () => void }, 'lessonClass'>;
function DiagramClass({ data }: NodeProps<ClassNode>) {
  return <div style={{overflow:'visible'}} className={'lesson-class ' + (data.kind.toLowerCase().includes('interface') ? 'is-interface ' : '') + (data.isDropTarget ? 'is-drop-target' : '')}
    onDragOver={event => {
      if (!event.dataTransfer.types.includes(methodDragType)) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      data.onDragHover(true);
    }}
    onDragLeave={event => {
      if (event.relatedTarget instanceof Element && event.currentTarget.contains(event.relatedTarget)) return;
      data.onDragHover(false);
    }}
    onDrop={event => {
      if (!event.dataTransfer.types.includes(methodDragType)) return;
      event.preventDefault();
      event.stopPropagation();
      data.onDragHover(false);
      data.onDropMethod(event.dataTransfer.getData(methodDragType));
      data.onEndMethodDrag();
    }}>
    {connectionHandles.map(side => <Handle key={side} id={side} type="source" position={{ top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }[side]} />)}
    <div className="lesson-class-title"><small>{data.kind}</small><strong>{data.label}</strong><button className="nodrag" aria-label={`Remove ${data.label} from diagram`} onClick={data.onRemove}>×</button></div>
    {(['field', 'method'] as const).map(kind => {
      const members = data.members.filter(member => member.kind === kind);
      if (kind === 'field' && !members.length) return null;
      return <div key={kind} className="lesson-class-members">
        <small className="lesson-member-heading">{kind === 'field' ? 'Fields' : 'Methods'}</small>
        {members.length ? members.map(member => <div key={member.id} className={'lesson-assigned-method nodrag nopan' + (data.draggedMethod === member.id ? ' is-dragging' : '')} draggable title="Drag to another class, or to an empty area to remove it from this class" onDragStart={event => data.onStartMethodDrag(event, member.id)} onDragEnd={data.onEndMethodDrag}><span>{kind === 'field' ? '−' : '+'}</span><code>{member.label}</code></div>) : <p>Drop fields or methods here</p>}
      </div>;
    })}
    {data.artwork && <div className="lesson-class-artwork"><img src={data.artwork.src} alt={data.artwork.alt} draggable={false}/></div>}
  </div>;
}
const nodeTypes = { lessonClass: DiagramClass };
const positions: Record<string, { x: number; y: number }> = { publisher: {x:0,y:0}, subscriber: {x:390,y:0}, narion: {x:0,y:480}, 'dre-kaar': {x:390,y:480} };
const label = (id: string) => classCards.find(card => card.id === id)?.label || id;
const hints = [
  'Give FoxPublisher the subscribers: Subscriber[] field to store active subscribers. Also give it subscribe(), unsubscribe(), notify(), and discoverDanger(). Looking for danger is its business logic.',
  'Subscriber is an interface with update(discovery). Each concrete subscriber implements this method. It has its own business logic to decide what to do.',
  'FoxPublisher keeps a list of Subscriber. NarionSubscriber and DreKaarSubscriber both implement Subscriber. Connect the fox to this interface. It does not need a link to each concrete class.',
];
export function ObserverLesson({ graph, onChange }: { graph: LessonGraph; onChange: (graph: LessonGraph) => void }) {
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [draggedMethod, setDraggedMethod] = useState<string | null>(null);
  const [tab, setTab] = useState<'classes'|'fields'|'methods'>('classes');
  const [relationship, setRelationship] = useState('stores');
  const [drawing, setDrawing] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const portConnectionSource = useRef<string | null>(null);
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
  const [issues, setIssues] = useState<string[] | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(-1);
  const [worked, setWorked] = useState(false);
  const [history, setHistory] = useState<LessonGraph[]>([]);
  const [nodeState, setNodeState] = useState<Record<string, Partial<ClassNode>>>({});
  const [flow, setFlow] = useState<ReactFlowInstance<ClassNode> | null>(null);
  const classKey = graph.classes.join(',');
  useEffect(() => {
    const timer = window.setTimeout(() => { void flow?.fitView({ padding: .18, maxZoom: 1 }); }, 80);
    return () => window.clearTimeout(timer);
  }, [flow, classKey]);
  function edit(next: LessonGraph) { setHistory(items => [...items.slice(-29), graph]); onChange(next); setIssues(null); setTrace([]); setMessage(''); setWorked(false); }
  function assignMethod(id: string, owner: string) {
    const member = memberCards.find(card => card.id === id);
    if (!member || (owner && !graph.classes.includes(owner)) || (graph.members[id] || '') === owner) return;
    const members = {...graph.members};
    if (owner) members[id] = owner;
    else delete members[id];
    edit({...graph, members});
    setMessage(owner ? `${member.label} added to ${label(owner)}.` : `${member.label} is no longer in a class.`);
  }
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
  function removeClass(id: string) { edit({ classes: graph.classes.filter(c => c !== id), members: Object.fromEntries(Object.entries(graph.members).filter(([,owner]) => owner !== id)), edges: graph.edges.filter(e => e.source !== id && e.target !== id) }); }
  function connect(from: string, to: string, type: string, sourceHandle?: string | null, targetHandle?: string | null) {
    if (!graph.classes.includes(from) || !graph.classes.includes(to)) { setMessage('Add both class cards to the diagram first.'); return; }
    if (from === to) { setMessage('Choose two different class cards.'); return; }
    if (graph.edges.some(e => e.source === from && e.target === to && e.type === type)) { setMessage('That relationship is already in the diagram.'); return; }
    edit({...graph, edges: [...graph.edges, { source: from, target: to, type, sourceHandle: isConnectionHandle(sourceHandle) ? sourceHandle : 'bottom', targetHandle: isConnectionHandle(targetHandle) ? targetHandle : 'top' }]});
    setMessage(`Relationship added: ${label(from)} → ${label(to)}. Check your diagram.`);
  }
  const nodes: ClassNode[] = classCards.filter(card => graph.classes.includes(card.id)).map(card => ({ id: card.id, type: 'lessonClass', position: positions[card.id]!, ...nodeState[card.id], className: connectionSource === card.id ? 'lesson-connection-source' : '', data: { ...card, draggedMethod, onStartMethodDrag: startMethodDrag, onEndMethodDrag: endMethodDrag, isDropTarget: dropTarget === card.id, onDragHover: hovered => setDropTarget(current => hovered ? card.id : current === card.id ? null : current), onDropMethod: id => assignMethod(id, card.id), artwork: classArtwork[card.id], members: memberCards.filter(member => graph.members[member.id] === card.id), onRemove: () => removeClass(card.id) } }));
  const edges = graph.edges.map((edge, index) => ({ ...edge, sourceHandle: normalizeConnectionHandle(edge.sourceHandle) ?? 'bottom', targetHandle: normalizeConnectionHandle(edge.targetHandle) ?? 'top', id: String(index), type: 'smoothstep', label: relationshipKinds.find(kind => kind.id === edge.type)?.label, markerEnd: edge.type === 'implements' ? 'lesson-implements-arrow' : {type: MarkerType.ArrowClosed, color:'#b6c9b1'}, style: {stroke:'#a7bba4', strokeWidth:1.6, strokeDasharray: edge.type === 'implements' ? '6 4' : undefined} }));
  function check(run = false) { const errors = validateLesson(graph); setIssues(errors); setMessage(''); setTrace(run ? simulateLesson(graph) : []); }
  return <section className="observer-lesson" onDragEnd={endMethodDrag}>
    <div className="lesson-intro"><div><p className="lesson-kicker">SCENARIO 01 <span>BEHAVIORAL PATTERN</span></p><h1>The fox’s discovery<span>Observer</span></h1><p className="lesson-situation">Before they enter the forest, Narion shows the group some magic bracelets. “My fox will go ahead and check the path,” he says. “It can send us a message about what it sees. It only sends a message when there is danger. When the path is safe, it keeps looking and sends nothing.”</p><p className="lesson-situation">“Put on a bracelet to subscribe and get its messages. Take it off to unsubscribe. Then you will get no more messages. The fox will still do its job, and everyone who still wears a bracelet will still get messages.”</p><p className="lesson-situation">Narion and Dre’Kaar put on their bracelets. Soon, the fox sees danger and sends both of them the same message. Narion plans a safer path. Dre’Kaar gets ready to protect the group. Each person chooses what to do. Later, Narion takes off his bracelet. The next time the fox sees danger, only Dre’Kaar gets its message.</p><p className="lesson-goal"><strong>Your task</strong> Build a class diagram. Let the fox notify each Subscriber through the Subscriber interface. The fox does not need to know their concrete classes.</p></div><figure><img src={foxArt} alt="The fox scouting with Narion in the forest"/><figcaption>One publisher → many subscribers</figcaption></figure></div>
    <div className="lesson-steps" aria-label="How to play"><span><b>1</b> Add class cards</span><span><b>2</b> Add fields & methods</span><span><b>3</b> Connect & test</span></div>
    <div className="lesson-workspace"><aside className="lesson-tray"><div className="lesson-section-title"><h2>Your cards</h2><span>{graph.classes.length}/4 classes</span></div><div className="lesson-tabs" role="group" aria-label="Card category"><button aria-pressed={tab === 'classes'} onClick={() => setTab('classes')}>Classes & interface</button><button aria-pressed={tab === 'fields'} onClick={() => setTab('fields')}>Fields</button><button aria-pressed={tab === 'methods'} onClick={() => setTab('methods')}>Methods</button></div>
      <p className="lesson-help">{tab === 'classes' ? 'Add class cards to your diagram.' : tab === 'fields' ? 'A field stores data. Drag a field onto a class. To move it, drag it to another class. To take it out, drag it to an empty area.' : 'A method does a job. Drag a method onto a class or interface. To move it, drag it to another class. To take it out, drag it to an empty area.'}</p>
      {tab === 'classes' ? <div className="lesson-card-list">{classCards.map(card => <article className="lesson-tray-card" key={card.id}><small>{card.kind}</small><h3>{card.label}</h3><p>{card.description}</p><button disabled={graph.classes.includes(card.id)} onClick={() => {edit({...graph, classes:[...graph.classes, card.id]});}}>{graph.classes.includes(card.id) ? '✓ In diagram' : '+ Add to diagram'}</button></article>)}</div> : <div className="lesson-card-list">{memberCards.filter(member => member.kind === (tab === 'fields' ? 'field' : 'method')).map(member => <article className={'lesson-member-card' + (draggedMethod === member.id ? ' is-dragging' : '')} key={member.id} draggable onDragStart={event => startMethodDrag(event, member.id)}><span className="lesson-drag-hint" aria-hidden="true">⠿ Drag to a class</span><code>{member.label}</code><p className="lesson-method-description">{member.description}</p></article>)}</div>}
      <div className="lesson-hints"><button onClick={() => setHint(value => Math.min(value + 1, hints.length - 1))} disabled={hint === hints.length - 1}>Show hint {Math.min(hint + 2, 3)} / 3</button>{hint >= 0 && <p>{hints[hint]}</p>}<button className="lesson-text-button" onClick={() => {edit(solutionLesson()); setWorked(true); setMessage('The solution is ready. Look at the fields, methods, and relationships. Then click Run discovery.');}}>Show solution</button></div>
    </aside><div className="lesson-board"><div className="lesson-board-toolbar"><div><h2>Your class diagram</h2><p>{Object.keys(graph.members).length}/{memberCards.length} member cards placed · {graph.edges.length} relationships</p></div><div><button disabled={!history.length} onClick={() => {const previous=history.at(-1); if(previous) {onChange(previous);setHistory(history.slice(0,-1));setIssues(null);setTrace([]);setMessage('Last edit undone.');setWorked(false);}}}>Undo</button><button onClick={() => {edit(emptyLesson());setNodeState({});}}>Reset</button></div></div>
      {worked && <div className="lesson-worked">Example solution · see what each class does.</div>}
      <div className="lesson-canvas" aria-label="Observer class diagram" onDragOver={event => {
        if (!isEmptyCanvasDrop(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropTarget(null);
      }} onDrop={event => {
        if (!isEmptyCanvasDrop(event)) return;
        event.preventDefault();
        assignMethod(event.dataTransfer.getData(methodDragType), '');
        endMethodDrag();
      }}><svg aria-hidden="true" width="0" height="0" style={{position:'absolute'}}><defs><marker id="lesson-implements-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1,1 L11,6 L1,11 Z" fill="#102019" stroke="#b6c9b1" strokeWidth="1"/></marker></defs></svg><ReactFlow connectionMode={ConnectionMode.Loose} onInit={setFlow} nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={changes => {
        const updated = applyNodeChanges(changes, nodes);
        setNodeState(Object.fromEntries(updated.map(node => [node.id, node])));
      }} onNodesDelete={deleted => {const removed=deleted.map(node => node.id);edit({classes:graph.classes.filter(id=>!removed.includes(id)),members:Object.fromEntries(Object.entries(graph.members).filter(([,owner])=>!removed.includes(owner))),edges:graph.edges.filter(edge=>!removed.includes(edge.source)&&!removed.includes(edge.target))});}} nodesDraggable={!drawing} onPaneClick={() => setConnectionSource(null)} onNodeClick={(event, node) => {
        if (!drawing || (event.target instanceof Element && event.target.closest('button, .lesson-assigned-method, .react-flow__handle'))) return;
        if (!connectionSource) setConnectionSource(node.id);
        else { connect(connectionSource, node.id, relationship); setConnectionSource(null); }
      }} onConnectStart={(_, { nodeId }) => { portConnectionSource.current = nodeId; }} onConnectEnd={() => { portConnectionSource.current = null; }} onConnect={connection => {
        // React Flow assigns endpoints by handle role, even when dragging from a target.
        const reverse = portConnectionSource.current === connection.target;
        connect(reverse ? connection.target : connection.source, reverse ? connection.source : connection.target, relationship, reverse ? connection.targetHandle : connection.sourceHandle, reverse ? connection.sourceHandle : connection.targetHandle);
        portConnectionSource.current = null;
        setConnectionSource(null);
      }} onEdgesDelete={deleted => edit({...graph,edges:graph.edges.filter((_,index) => !deleted.some(edge => edge.id === String(index)))})} defaultViewport={{x:35,y:35,zoom:.83}} minZoom={.35} maxZoom={1.5} colorMode="dark"><Background gap={22} color="#314338"/><Controls position="bottom-right" showInteractive={false}/>
        <Panel position="bottom-left" className="lesson-arrow-tools nodrag nopan">
          <div role="group" aria-label="Relationship drawing tools">
            <button type="button" aria-pressed={!drawing} title="Move cards (Escape)" onClick={() => {setDrawing(false);setConnectionSource(null);}}>↖ <span>Move</span></button>
            {relationshipKinds.map(kind => <button type="button" key={kind.id} aria-label={`Draw ${kind.label}`} aria-pressed={drawing && relationship === kind.id} title={kind.label} onClick={() => selectRelationship(kind.id)}>
              <svg width="38" height="18" viewBox="0 0 38 18" aria-hidden="true"><path d="M2 9 H26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray={kind.id === 'implements' ? '4 3' : undefined}/><path d="M25 3 L35 9 L25 15 Z" fill={kind.id === 'implements' ? 'none' : 'currentColor'} stroke="currentColor" strokeWidth="1.6"/></svg>
              <span>{kind.id === 'stores' ? 'Stores' : 'Implements'}</span>
            </button>)}
          </div>
          <p role="status">{drawing ? connectionSource ? `From ${label(connectionSource)}: click the second class` : 'Click the first class, then the second class' : 'Move cards · choose an arrow to connect'}</p>
        </Panel></ReactFlow>{!nodes.length && <div className="lesson-empty"><span aria-hidden="true">▤ → ▤</span><h3>Start with the classes</h3><p>Add cards from the list.<br/>Then add fields and methods.</p></div>}</div>
      {graph.edges.length > 0 && <ul className="lesson-relations" aria-label="Diagram relationships">{graph.edges.map((edge,index) => <li key={index}><span><strong>{label(edge.source)}</strong> <em>{relationshipKinds.find(kind => kind.id === edge.type)?.label}</em> <strong>{label(edge.target)}</strong></span><button aria-label={`Remove relationship ${index+1}`} onClick={() => edit({...graph,edges:graph.edges.filter((_,i) => i !== index)})}>×</button></li>)}</ul>}
      <div className="lesson-actions"><button className="primary" onClick={() => check()}>Check diagram</button><button onClick={() => check(true)}>Run discovery →</button><span>Are all fields and methods in the right place?</span></div>
      <div aria-live="polite" className="lesson-result">{message && <p>{message}</p>}{issues && (issues.length ? <div className="lesson-feedback"><h3>Keep building</h3><ul>{issues.map((issue,index) => <li key={index}>{issue}</li>)}</ul></div> : <div className="lesson-feedback success"><h3>{worked ? 'This is a complete Observer diagram' : 'Your Observer diagram works'}</h3><p>The publisher uses the Subscriber interface. Each subscriber decides what to do with the message. A new subscriber can join without changes to the fox.</p></div>)}</div>
      {trace.length > 0 && <section className="lesson-trace"><p className="lesson-kicker">DISCOVERY TRACE</p><h3>Follow the notification</h3><ol>{trace.map((step,index) => <li key={index}>{step}</li>)}</ol></section>}
    </div></div>
    <div className="lesson-concept"><strong>The main idea</strong><p><b>Publisher</b> keeps a list of subscribers and sends them messages. <b>Subscriber</b> is an interface with an <code>update()</code> method. Each concrete subscriber implements this method and decides what to do with the message.</p></div>
  </section>;
}
