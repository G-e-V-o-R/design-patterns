import { useEffect, useState, type DragEvent } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, applyNodeChanges, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { classCards, memberCards, relationshipKinds, classLabel, edgeKey, emptyLesson, solutionLesson, getLessonIssues, simulateLesson, hints, type MediatorGraph, type MediatorIssue, type CoordinationResult, type RequestKind } from './model';
import { MediatorDemo } from './MediatorDemo';
import ravenArt from '../../../docs/hobbit/scenarios/2.2.png?url';
import './mediator.css';

const dragType = 'application/x-mediator-member';
type ClassNode = Node<{ label: string; kind: string; members: typeof memberCards; needsFix: boolean; issueMembers: Set<string>; onRemove: () => void; onAssign: (member: string) => void }, 'mediatorClass'>;
function DiagramClass({ data }: NodeProps<ClassNode>) {
  return <div className={'med-class' + (data.kind === 'interface' ? ' med-interface' : '') + (data.needsFix ? ' med-needs-fix' : '')}
    onDragOver={event => { if (event.dataTransfer.types.includes(dragType)) { event.preventDefault(); event.stopPropagation(); } }}
    onDrop={event => { const id = event.dataTransfer.getData(dragType); if (id) { event.preventDefault(); event.stopPropagation(); data.onAssign(id); } }}>
    <Handle type="target" position={Position.Top}/>
    <header><small>{data.kind}</small><strong>{data.label}</strong><button className="nodrag" aria-label={`Remove ${data.label}`} onClick={data.onRemove}>×</button>{data.needsFix && <span className="med-fix">Fix this</span>}</header>
    {(['field', 'method'] as const).map(kind => <div className="med-class-members" key={kind}><small>{kind === 'field' ? 'Fields' : 'Methods'}</small>{data.members.filter(member => member.kind === kind).map(member => <code key={member.id} className={data.issueMembers.has(member.id) ? 'med-fix' : ''}>{member.label}</code>)}{!data.members.some(member => member.kind === kind) && <p>Assign {kind}s from your cards</p>}</div>)}
    <Handle type="source" position={Position.Bottom}/>
  </div>;
}
const nodeTypes = { mediatorClass: DiagramClass };
const positions: Record<string, { x: number; y: number }> = { mediator: {x:360,y:0}, raven: {x:0,y:0}, 'dre-kaar': {x:0,y:390}, narion: {x:360,y:390}, faelina: {x:0,y:740}, saerenn: {x:360,y:740} };

/** Public module entry point. Every mutable value belongs to this mounted scenario. */
export function MediatorScenario({ active = true }: { active?: boolean }) {
  const [graph, setGraph] = useState(emptyLesson);
  const [history, setHistory] = useState<MediatorGraph[]>([]);
  const [tab, setTab] = useState<'classes' | 'members'>('classes');
  const [issues, setIssues] = useState<MediatorIssue[] | null>(null);
  const [hint, setHint] = useState(-1);
  const [message, setMessage] = useState('');
  const [worked, setWorked] = useState(false);
  const [result, setResult] = useState<CoordinationResult | null>(null);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [relationship, setRelationship] = useState('uses');
  const [nodeState, setNodeState] = useState<Record<string, Partial<ClassNode>>>({});
  const [flow, setFlow] = useState<ReactFlowInstance<ClassNode> | null>(null);
  const classKey = graph.classes.join(',');
  useEffect(() => { if (!active) return; const timer = window.setTimeout(() => { void flow?.fitView({ padding: .2, maxZoom: .9 }); }, 100); return () => window.clearTimeout(timer); }, [flow, classKey, active]);
  const ready = getLessonIssues(graph).length === 0;
  const issueClasses = new Set(issues?.flatMap(issue => issue.classIds));
  const issueMembers = new Set(issues?.flatMap(issue => issue.memberIds));
  const issueEdges = new Set(issues?.flatMap(issue => issue.edgeIndices));
  function edit(next: MediatorGraph) { setHistory(items => [...items.slice(-29), graph]); setGraph(next); setIssues(null); setResult(null); setMessage(''); setWorked(false); }
  function assign(memberId: string, owner: string) {
    if (!memberCards.some(member => member.id === memberId) || (owner && !graph.classes.includes(owner))) return;
    if ((graph.members[memberId] ?? '') === owner) return;
    const members = {...graph.members};
    if (owner) members[memberId] = owner; else delete members[memberId];
    edit({...graph, members});
    setMessage(owner ? `Member assigned to ${classLabel(owner)}.` : 'Member returned to the tray.');
  }
  function removeClasses(ids: string[]) { edit({classes:graph.classes.filter(id => !ids.includes(id)), members:Object.fromEntries(Object.entries(graph.members).filter(([,owner]) => !ids.includes(owner))), edges:graph.edges.filter(edge => !ids.includes(edge.source) && !ids.includes(edge.target))}); }
  function connect(from: string, to: string) {
    if (!graph.classes.includes(from) || !graph.classes.includes(to)) { setMessage('Choose two classes already in the diagram.'); return; }
    if (from === to) { setMessage('Choose two different classes.'); return; }
    const edge = { source: from, target: to, type: relationship };
    if (graph.edges.some(existing => edgeKey(existing) === edgeKey(edge))) { setMessage('That relationship already exists.'); return; }
    edit({...graph, edges:[...graph.edges, edge]});
    setMessage(`Connected ${classLabel(from)} to ${classLabel(to)}. Check the diagram to test your choice.`);
  }
  function run(request: RequestKind) { const nextIssues = getLessonIssues(graph); setIssues(nextIssues); setMessage(''); setResult(simulateLesson(graph, request)); }
  function startDrag(event: DragEvent, id: string) { event.dataTransfer.setData(dragType, id); event.dataTransfer.effectAllowed = 'move'; }
  const nodes: ClassNode[] = classCards.filter(card => graph.classes.includes(card.id)).map(card => ({ id:card.id, type:'mediatorClass', position:positions[card.id]!, ...nodeState[card.id], data:{...card, members:memberCards.filter(member => graph.members[member.id] === card.id), needsFix:issueClasses.has(card.id), issueMembers, onRemove:() => removeClasses([card.id]), onAssign:id => assign(id,card.id)} }));
  const edges = graph.edges.map((edge,index) => ({...edge,id:String(index),type:'smoothstep',label:relationshipKinds.find(kind => kind.id === edge.type)?.label, markerEnd:edge.type==='implements'?'mediator-implements-arrow':{type:MarkerType.ArrowClosed,color:issueEdges.has(index)?'#f0a28e':'#c6bb8e'},style:{stroke:issueEdges.has(index)?'#f0a28e':'#a5b99e',strokeWidth:issueEdges.has(index)?3:1.6,strokeDasharray:edge.type==='implements'?'6 4':undefined}}));
  return <section className="mediator-scenario" aria-labelledby="mediator-heading">
    <div className="med-intro"><div><p className="med-kicker">SCENARIO 02 · BEHAVIORAL PATTERN</p><h1 id="mediator-heading">Thoughts through the raven <span>Mediator</span></h1><p>An ambush scatters the group. Elvir sends his raven to coordinate their requests. Dre’Kaar needs cover; Faelina needs shelter. The raven knows who can help and passes each request to the right companion.</p><p className="med-task"><strong>Your task</strong> Build a class diagram where companions ask through a Mediator interface. Let RavenMediator decide who responds.</p></div><figure><img src={ravenArt} alt="The raven coordinating the companions"/><figcaption>Many requests → one coordinator</figcaption></figure></div>
    <div className="med-steps"><span>1 · Add class cards</span><span>2 · Assign members</span><span>3 · Connect & test</span></div>
    <div className="med-workspace"><aside className="med-tray"><h2>Your cards <small>{graph.classes.length}/6 classes</small></h2><div className="med-tabs" role="group" aria-label="Mediator card category"><button aria-pressed={tab==='classes'} onClick={() => setTab('classes')}>Classes & interface</button><button aria-pressed={tab==='members'} onClick={() => setTab('members')}>Fields & methods</button></div>
      <p className="med-help">{tab==='classes'?'Add the six cards. Their relationships describe who each class knows.':'Choose a class for each member, or drag the member onto a diagram card. Choose “Unassigned” to remove it.'}</p>
      <div className="med-card-list">{tab==='classes'?classCards.map(card => <article key={card.id} className={'med-tray-card'+(issueClasses.has(card.id)?' med-needs-fix':'')}><small>{card.kind}</small><h3>{card.label}</h3><p>{card.description}</p>{issueClasses.has(card.id)&&<span className="med-fix">Fix this</span>}<button disabled={graph.classes.includes(card.id)} onClick={() => edit({...graph,classes:[...graph.classes,card.id]})}>{graph.classes.includes(card.id)?'✓ In diagram':`Add ${card.label}`}</button></article>):memberCards.map(member => <article draggable onDragStart={event => startDrag(event,member.id)} key={member.id} className={'med-member-card'+(issueMembers.has(member.id)?' med-needs-fix':'')}><small>{member.kind} · drag or assign</small><code>{member.label}</code><p>{member.description}</p>{issueMembers.has(member.id)&&<span className="med-fix">Fix this</span>}<label>Assign to<select aria-label={`Assign ${member.label}`} value={graph.members[member.id]??''} onChange={event=>assign(member.id,event.target.value)}><option value="">Unassigned</option>{classCards.filter(card=>graph.classes.includes(card.id)).map(card=><option key={card.id} value={card.id}>{card.label}</option>)}</select></label></article>)}</div>
      <div className="med-hints"><button disabled={hint===hints.length-1} onClick={()=>setHint(value=>Math.min(value+1,hints.length-1))}>Show hint {Math.min(hint+2,3)} / 3</button>{hint>=0&&<p>{hints[hint]}</p>}<button className="med-text-button" onClick={()=>{edit(solutionLesson());setWorked(true);setMessage('Example ready. Try both requests below the diagram.');}}>Show solution</button></div>
    </aside><div className="med-board"><header className="med-board-heading"><div><h2>Your class diagram</h2><p>{Object.keys(graph.members).length}/{memberCards.length} members · {graph.edges.length} relationships</p></div><div className="med-actions"><button disabled={!history.length} onClick={()=>{const previous=history.at(-1);if(previous){setGraph(previous);setHistory(history.slice(0,-1));setIssues(null);setResult(null);setWorked(false);setMessage('Last edit undone.');}}}>Undo</button><button onClick={()=>{edit(emptyLesson());setNodeState({});setSource('');setTarget('');}}>Reset</button></div></header>
      {worked&&<p className="med-worked">Example solution · follow how each participant uses the mediator.</p>}
      <div className="med-canvas" aria-label="Mediator class diagram"><svg aria-hidden="true" width="0" height="0" style={{position:'absolute'}}><defs><marker id="mediator-implements-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1,1 L11,6 L1,11 Z" fill="#102019" stroke="#c6bb8e" strokeWidth="1"/></marker></defs></svg><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onInit={setFlow} onNodesChange={changes=>{const updated=applyNodeChanges(changes,nodes);setNodeState(Object.fromEntries(updated.map(node=>[node.id,node])));}} onNodesDelete={deleted=>removeClasses(deleted.map(node=>node.id))} onEdgesDelete={deleted=>edit({...graph,edges:graph.edges.filter((_,index)=>!deleted.some(edge=>edge.id===String(index)))})} onConnect={connection=>connect(connection.source,connection.target)} minZoom={.25} maxZoom={1.5} defaultViewport={{x:30,y:30,zoom:.65}} colorMode="dark"><Background gap={22} color="#314338"/><Controls showInteractive={false}/></ReactFlow>{!nodes.length&&<div className="med-empty"><span aria-hidden="true">◇ → ◇</span><h3>Who coordinates the group?</h3><p>Add your class cards to begin.</p></div>}</div>
      <div className="med-connections"><h3>Connect classes</h3><p>Choose the relationship for both the controls below and arrows dragged from the bottom of one card to the top of another.</p><div className="med-connect-fields"><label>From<select value={graph.classes.includes(source)?source:''} onChange={event=>setSource(event.target.value)}><option value="">Choose class</option>{classCards.filter(card=>graph.classes.includes(card.id)).map(card=><option value={card.id} key={card.id}>{card.label}</option>)}</select></label><label>Relationship<select value={relationship} onChange={event=>setRelationship(event.target.value)}>{relationshipKinds.map(kind=><option key={kind.id} value={kind.id}>{kind.label}</option>)}</select></label><label>To<select value={graph.classes.includes(target)?target:''} onChange={event=>setTarget(event.target.value)}><option value="">Choose class</option>{classCards.filter(card=>graph.classes.includes(card.id)).map(card=><option value={card.id} key={card.id}>{card.label}</option>)}</select></label><button onClick={()=>connect(source,target)}>Add relationship</button></div><div className="med-arrow-help">{relationshipKinds.map(kind=><p key={kind.id}>{kind.description}</p>)}</div></div>
      {graph.edges.length>0&&<ul className="med-relations" aria-label="Mediator relationships">{graph.edges.map((edge,index)=><li className={issueEdges.has(index)?'med-needs-fix':''} key={index}><span>{classLabel(edge.source)} <em>{relationshipKinds.find(kind=>kind.id===edge.type)?.label}</em> {classLabel(edge.target)}{issueEdges.has(index)&&<b className="med-fix">Fix this arrow</b>}</span><button aria-label={`Remove mediator relationship ${index+1}`} onClick={()=>edit({...graph,edges:graph.edges.filter((_,i)=>i!==index)})}>×</button></li>)}</ul>}
      <div className="med-actions med-check"><button className="med-primary" onClick={()=>{setIssues(getLessonIssues(graph));setMessage('');setResult(null);}}>Check diagram</button><span>Does coordination belong to the raven?</span></div>
      <div className="med-feedback" aria-live="polite">{message&&<p>{message}</p>}{issues&&(issues.length?<div><h3>Keep building</h3><p>Look for “Fix this” on the cards and arrows.</p><ul>{issues.map((issue,index)=><li key={index}>{issue.message}</li>)}</ul></div>:<div className="med-success"><h3>Your Mediator diagram works</h3><p>Participants depend on the Mediator contract. The raven coordinates requests; each companion owns its own action.</p></div>)}</div>
      <MediatorDemo ready={ready} result={result} onRun={run}/>
    </div></div>
    <div className="med-concept"><strong>The main idea</strong><p>Keep coordination in the mediator. Participants can cooperate without holding references to each other. Changing the raven’s routing rule does not require changing the requesters.</p></div>
  </section>;
}
export default MediatorScenario;
