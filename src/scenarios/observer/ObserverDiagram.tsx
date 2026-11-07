import { useEffect, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { ReactFlow, Background, Controls, Panel, MarkerType, ConnectionMode, type Connection, type Edge, type NodeChange, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { relationshipKinds } from './model';
import { label } from './lessonContent';
import { nodeTypes, type ClassNode } from './DiagramClass';

export function ObserverDiagram({ nodes, edges, classKey, active = true, drawing, relationship, connectionSource, onNodesChange, onNodesDelete, onEdgesDelete, onConnect, onConnectStart, onConnectEnd, onNodeClick, onPaneClick, onSelectRelationship, onMoveMode, onDragOver, onDrop }: {
  nodes: ClassNode[];
  edges: Edge[];
  classKey: string;
  active?: boolean;
  drawing: boolean;
  relationship: string;
  connectionSource: string | null;
  onNodesChange: (changes: NodeChange<ClassNode>[]) => void;
  onNodesDelete: (nodes: ClassNode[]) => void;
  onEdgesDelete: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onConnectStart: (nodeId: string | null) => void;
  onConnectEnd: () => void;
  onNodeClick: (event: ReactMouseEvent, node: ClassNode) => void;
  onPaneClick: () => void;
  onSelectRelationship: (type: string) => void;
  onMoveMode: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  const [flow, setFlow] = useState<ReactFlowInstance<ClassNode> | null>(null);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => { void flow?.fitView({ padding: .18, maxZoom: 1 }); }, 80);
    return () => window.clearTimeout(timer);
  }, [flow, classKey, active]);
  return <div className="lesson-canvas" aria-label="Observer class diagram" onDragOver={onDragOver} onDrop={onDrop}><svg aria-hidden="true" width="0" height="0" style={{position:'absolute'}}><defs><marker id="lesson-implements-arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1,1 L11,6 L1,11 Z" fill="#102019" stroke="#b6c9b1" strokeWidth="1"/></marker></defs></svg><ReactFlow connectionMode={ConnectionMode.Loose} onInit={setFlow} nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onNodesDelete={onNodesDelete} nodesDraggable={!drawing} onPaneClick={onPaneClick} onNodeClick={onNodeClick} onConnectStart={(_, { nodeId }) => onConnectStart(nodeId)} onConnectEnd={onConnectEnd} onConnect={onConnect} onEdgesDelete={onEdgesDelete} defaultViewport={{x:35,y:35,zoom:.83}} minZoom={.35} maxZoom={1.5} colorMode="dark"><Background gap={22} color="#314338"/><Controls position="bottom-right" showInteractive={false}/>
    <Panel position="bottom-left" className="lesson-arrow-tools nodrag nopan">
      <div role="group" aria-label="Relationship drawing tools">
        <button type="button" aria-pressed={!drawing} title="Move cards (Escape)" onClick={onMoveMode}>↖ <span>Move</span></button>
        {relationshipKinds.map(kind => <button type="button" key={kind.id} aria-label={`Draw ${kind.label}`} aria-pressed={drawing && relationship === kind.id} title={kind.description} aria-describedby={`arrow-help-${kind.id}`} onClick={() => onSelectRelationship(kind.id)}>
          <svg width="38" height="18" viewBox="0 0 38 18" aria-hidden="true"><path d="M2 9 H26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray={kind.id === 'implements' ? '4 3' : undefined}/><path d="M25 3 L35 9 L25 15 Z" fill={kind.id === 'implements' ? 'none' : 'currentColor'} stroke="currentColor" strokeWidth="1.6"/></svg>
          <span>{kind.id === 'stores' ? 'Stores' : 'Implements'}</span>
        </button>)}
      </div>
      <p role="status">{drawing ? connectionSource ? `From ${label(connectionSource)}: click the second class` : 'Click the first class, then the second class' : 'Move cards · choose an arrow to connect'}</p>
    </Panel></ReactFlow>{!nodes.length && <div className="lesson-empty"><span aria-hidden="true">▤ → ▤</span><h3>Start with the classes</h3><p>Add cards from the list.<br/>Then add fields and methods.</p></div>}</div>;
}
