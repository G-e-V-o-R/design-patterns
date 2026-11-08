import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  Panel,
  ReactFlow,
  type Connection,
  type Edge,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { relationshipKinds, classLabel } from './model';
import { nodeTypes, type ClassNode } from './ClassDiagramNode';

type MediatorDiagramProps = {
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
};

export function MediatorDiagram({
  nodes,
  edges,
  classKey,
  active = true,
  drawing,
  relationship,
  connectionSource,
  onNodesChange,
  onNodesDelete,
  onEdgesDelete,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeClick,
  onPaneClick,
  onSelectRelationship,
  onMoveMode,
}: MediatorDiagramProps)
{
  const [flow, setFlow] = useState<ReactFlowInstance<ClassNode> | null>(null);

  useEffect(() =>
  {
    if (!active)
    {
      return;
    }

    const timerId = window.setTimeout(() =>
    {
      void flow?.fitView({ padding: 0.2, maxZoom: 0.9 });
    }, 100);

    return () => window.clearTimeout(timerId);
  }, [flow, classKey, active]);

  return (
    <div className="med-canvas" aria-label="Mediator class diagram">
      <ArrowMarker />

      <ReactFlow
        connectionMode={ConnectionMode.Loose}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setFlow}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onConnectStart={(_, connectionState) =>
          onConnectStart(connectionState.nodeId)}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={!drawing}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.25}
        maxZoom={1.5}
        defaultViewport={{ x: 30, y: 30, zoom: 0.65 }}
        colorMode="dark"
      >
        <Background gap={22} color="#314338" />
        <Controls showInteractive={false} />
        <RelationshipTools
          drawing={drawing}
          relationship={relationship}
          connectionSource={connectionSource}
          onMoveMode={onMoveMode}
          onSelectRelationship={onSelectRelationship}
        />
      </ReactFlow>

      {nodes.length === 0 && <EmptyDiagramMessage />}
    </div>
  );
}

function RelationshipTools({
  drawing,
  relationship,
  connectionSource,
  onMoveMode,
  onSelectRelationship,
}: {
  drawing: boolean;
  relationship: string;
  connectionSource: string | null;
  onMoveMode: () => void;
  onSelectRelationship: (type: string) => void;
})
{
  let drawingStatus = 'Move cards · choose a relationship to connect';
  if (drawing && connectionSource)
  {
    drawingStatus = `From ${classLabel(connectionSource)}: click the second class`;
  }
  else if (drawing)
  {
    drawingStatus = 'Click the first class, then the second class';
  }

  return (
    <Panel position="bottom-left" className="med-arrow-tools nodrag nopan">
      <div role="group" aria-label="Relationship drawing tools">
        <button
          type="button"
          aria-pressed={!drawing}
          title="Move cards (Escape)"
          onClick={onMoveMode}
        >
          ↖ <span>Move</span>
        </button>
        {relationshipKinds.map(kind => (
          <RelationshipToolButton
            key={kind.id}
            kind={kind}
            isSelected={drawing && relationship === kind.id}
            onSelect={onSelectRelationship}
          />
        ))}
      </div>
      <p role="status">{drawingStatus}</p>
    </Panel>
  );
}

function RelationshipToolButton({
  kind,
  isSelected,
  onSelect,
}: {
  kind: (typeof relationshipKinds)[number];
  isSelected: boolean;
  onSelect: (type: string) => void;
})
{
  let toolLabel = 'Knows';
  if (kind.id === 'uses')
  {
    toolLabel = 'Uses';
  }
  else if (kind.id === 'implements')
  {
    toolLabel = 'Implements';
  }

  return (
    <button
      type="button"
      aria-label={`Draw ${kind.label}`}
      aria-pressed={isSelected}
      title={`Draw ${kind.label}`}
      onClick={() => onSelect(kind.id)}
    >
      <RelationshipIcon kindId={kind.id} />
      <span>{toolLabel}</span>
    </button>
  );
}

function RelationshipIcon({ kindId }: { kindId: string })
{
  let linePattern: string | undefined;
  let arrowFill = 'currentColor';
  if (kindId === 'implements')
  {
    linePattern = '4 3';
    arrowFill = 'none';
  }

  return (
    <svg width="38" height="18" viewBox="0 0 38 18" aria-hidden="true">
      <path
        d="M2 9 H26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray={linePattern}
      />
      <path
        d="M25 3 L35 9 L25 15 Z"
        fill={arrowFill}
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ArrowMarker()
{
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: 'absolute' }}
    >
      <defs>
        <marker
          id="mediator-implements-arrow"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
        >
          <path
            d="M1,1 L11,6 L1,11 Z"
            fill="#102019"
            stroke="#c6bb8e"
            strokeWidth="1"
          />
        </marker>
      </defs>
    </svg>
  );
}

function EmptyDiagramMessage()
{
  return (
    <div className="med-empty">
      <span aria-hidden="true">◇ → ◇</span>
      <h3>Who coordinates the group?</h3>
      <p>Add your class cards to begin.</p>
    </div>
  );
}
