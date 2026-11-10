import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  Panel,
  ReactFlow,
  type Connection,
  type Edge,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { classLabel, relationshipKinds } from './model';
import { nodeTypes, type ChainNode } from './ClassDiagramNode';

type ChainDiagramProps = {
  nodes: ChainNode[];
  edges: Edge[];
  classKey: string;
  compactLayout: boolean;
  active?: boolean;
  drawing: boolean;
  relationship: string;
  connectionSource: string | null;
  onNodesChange: (changes: NodeChange<ChainNode>[]) => void;
  onNodesDelete: (nodes: ChainNode[]) => void;
  onEdgesDelete: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onConnectStart: (nodeId: string | null) => void;
  onConnectEnd: () => void;
  onNodeClick: (event: ReactMouseEvent, node: ChainNode) => void;
  onPaneClick: () => void;
  onSelectRelationship: (type: string) => void;
  onMoveMode: () => void;
};

export function ChainDiagram({
  nodes,
  edges,
  classKey,
  compactLayout,
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
}: ChainDiagramProps)
{
  const [flow, setFlow] = useState<ReactFlowInstance<ChainNode> | null>(null);

  useEffect(() =>
  {
    if (!active)
    {
      return;
    }

    const timerId = window.setTimeout(() =>
    {
      if (compactLayout)
      {
        void flow?.setViewport({ x: 20, y: 20, zoom: 0.9 });
      }
      else
      {
        void flow?.fitView({ padding: 0.2, maxZoom: 0.9 });
      }
    }, 100);

    return () => window.clearTimeout(timerId);
  }, [flow, classKey, compactLayout, active]);

  return (
    <div className="chain-canvas" aria-label="Chain of Responsibility class diagram">
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
        onConnectStart={(_, connectionState) => onConnectStart(connectionState.nodeId)}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={!drawing}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.25}
        maxZoom={1.5}
        defaultViewport={{ x: 20, y: 20, zoom: 0.7 }}
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
    <Panel position="bottom-left" className="chain-arrow-tools nodrag nopan">
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
  let toolLabel = 'Next';
  if (kind.id === 'implements')
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
      <span>{toolLabel}</span>
    </button>
  );
}

function EmptyDiagramMessage()
{
  return (
    <div className="chain-empty-state">
      Add the classes, assign members, and connect the next links to build the chain.
    </div>
  );
}
