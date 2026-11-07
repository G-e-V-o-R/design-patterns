import { useEffect, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
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
import { relationshipKinds } from './model';
import { label } from './lessonContent';
import { nodeTypes, type ObserverClassNode } from './ObserverClassDiagramNode';

type ObserverDiagramProps = {
  nodes: ObserverClassNode[];
  edges: Edge[];
  classKey: string;
  active?: boolean;
  drawing: boolean;
  relationship: string;
  connectionSource: string | null;
  onNodesChange: (changes: NodeChange<ObserverClassNode>[]) => void;
  onNodesDelete: (nodes: ObserverClassNode[]) => void;
  onEdgesDelete: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onConnectStart: (nodeId: string | null) => void;
  onConnectEnd: () => void;
  onNodeClick: (event: ReactMouseEvent, node: ObserverClassNode) => void;
  onPaneClick: () => void;
  onSelectRelationship: (type: string) => void;
  onMoveMode: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

export function ObserverDiagram({
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
  onDragOver,
  onDrop,
}: ObserverDiagramProps)
{
  const [flow, setFlow] = useState<ReactFlowInstance<ObserverClassNode> | null>(null);

  useEffect(() =>
  {
    if (!active)
    {
      return;
    }

    const timerId = window.setTimeout(() =>
    {
      if (flow)
      {
        void flow.fitView({ padding: 0.18, maxZoom: 1 });
      }
    }, 80);

    return () => window.clearTimeout(timerId);
  }, [flow, classKey, active]);

  return (
    <div
      className="lesson-canvas"
      aria-label="Observer class diagram"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ArrowMarker />
      <ReactFlow
        connectionMode={ConnectionMode.Loose}
        onInit={setFlow}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        nodesDraggable={!drawing}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onConnectStart={(_, connectionState) =>
          onConnectStart(connectionState.nodeId)}
        onConnectEnd={onConnectEnd}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        defaultViewport={{ x: 35, y: 35, zoom: 0.83 }}
        minZoom={0.35}
        maxZoom={1.5}
        colorMode="dark"
      >
        <Background gap={22} color="#314338" />
        <Controls position="bottom-right" showInteractive={false} />
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
          id="lesson-implements-arrow"
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
            stroke="#b6c9b1"
            strokeWidth="1"
          />
        </marker>
      </defs>
    </svg>
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
  let drawingStatus = 'Move cards · choose an arrow to connect';
  if (drawing && connectionSource)
  {
    drawingStatus = `From ${label(connectionSource)}: click the second class`;
  }
  else if (drawing)
  {
    drawingStatus = 'Click the first class, then the second class';
  }

  return (
    <Panel position="bottom-left" className="lesson-arrow-tools nodrag nopan">
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
  let toolLabel = 'Stores';
  if (kind.id === 'implements')
  {
    toolLabel = 'Implements';
  }

  return (
    <button
      type="button"
      aria-label={`Draw ${kind.label}`}
      aria-pressed={isSelected}
      title={kind.description}
      aria-describedby={`arrow-help-${kind.id}`}
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

function EmptyDiagramMessage()
{
  return (
    <div className="lesson-empty">
      <span aria-hidden="true">▤ → ▤</span>
      <h3>Start with the classes</h3>
      <p>
        Add cards from the list.
        <br />
        Then add fields and methods.
      </p>
    </div>
  );
}
