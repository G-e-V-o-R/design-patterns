import { useEffect, useState } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, type ClassNode } from './ClassDiagramNode';

type MediatorDiagramProps = {
  nodes: ClassNode[];
  edges: Edge[];
  classKey: string;
  active?: boolean;
  onNodesChange: (changes: NodeChange<ClassNode>[]) => void;
  onNodesDelete: (nodes: ClassNode[]) => void;
  onEdgesDelete: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
};

export function MediatorDiagram({
  nodes,
  edges,
  classKey,
  active = true,
  onNodesChange,
  onNodesDelete,
  onEdgesDelete,
  onConnect,
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
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setFlow}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        minZoom={0.25}
        maxZoom={1.5}
        defaultViewport={{ x: 30, y: 30, zoom: 0.65 }}
        colorMode="dark"
      >
        <Background gap={22} color="#314338" />
        <Controls showInteractive={false} />
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
