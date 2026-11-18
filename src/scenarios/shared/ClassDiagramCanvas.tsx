import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeTypes,
  type OnReconnect,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { orientConnection } from './connections';
import { RelationshipMarkers, RelationshipTools, type RelationshipToolsProps } from './RelationshipTools';

export type DiagramCanvasProps<NodeType extends Node> = RelationshipToolsProps & {
  nodes: NodeType[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  classKey: string;
  active?: boolean;
  markerNamespace: string;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  onNodesChange: (changes: NodeChange<NodeType>[]) => void;
  onEdgesChange?: (changes: EdgeChange<Edge>[]) => void;
  onNodesDelete: (nodes: NodeType[]) => void;
  onEdgesDelete: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onReconnect?: OnReconnect<Edge>;
  onNodeClick: (event: MouseEvent, node: NodeType) => void;
  onPaneClick: () => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
};

export type ScenarioDiagramProps<NodeType extends Node> = Omit<
  DiagramCanvasProps<NodeType>,
  'nodeTypes' | 'markerNamespace' | 'label' | 'emptyTitle' | 'emptyDescription' | 'relationships' | 'classLabel'
>;

export function ClassDiagramCanvas<NodeType extends Node>({
  nodes,
  edges,
  nodeTypes,
  classKey,
  active = true,
  markerNamespace,
  label,
  emptyTitle,
  emptyDescription,
  onNodesChange,
  onEdgesChange,
  onNodesDelete,
  onEdgesDelete,
  onConnect,
  onReconnect,
  onNodeClick,
  onPaneClick,
  onDragOver,
  onDrop,
  ...relationshipTools
}: DiagramCanvasProps<NodeType>)
{
  const [flow, setFlow] = useState<ReactFlowInstance<NodeType> | null>(null);

  const dragStartNode = useRef<string | null>(null);
  const clickStartNode = useRef<string | null>(null);

  function handleConnect(connection: Connection)
  {
    onConnect(orientConnection(connection, dragStartNode.current ?? clickStartNode.current));
    dragStartNode.current = null;
    clickStartNode.current = null;
  }

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
    <div className="pattern-canvas" aria-label={label} onDragOver={onDragOver} onDrop={onDrop}>
      <RelationshipMarkers relationships={relationshipTools.relationships} namespace={markerNamespace} />
      <ReactFlow
        connectionMode={ConnectionMode.Loose}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setFlow}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={handleConnect}
        onReconnect={onReconnect}
        edgesReconnectable={false}
        elevateEdgesOnSelect
        onConnectStart={(_, state) =>
        {
          dragStartNode.current = state.nodeId;
        }}
        onConnectEnd={() =>
        {
          dragStartNode.current = null;
        }}
        onClickConnectStart={(_, state) =>
        {
          clickStartNode.current = state.nodeId;
        }}
        onClickConnectEnd={() =>
        {
          clickStartNode.current = null;
        }}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={!relationshipTools.drawing}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.25}
        maxZoom={1.5}
        defaultViewport={{ x: 30, y: 30, zoom: 0.65 }}
        colorMode="dark"
      >
        <Background gap={22} color="#314338" />
        <Controls position="bottom-right" showInteractive={false} />
        <RelationshipTools {...relationshipTools} />
      </ReactFlow>
      {nodes.length === 0 && (
        <div className="pattern-empty">
          <span aria-hidden="true">▤ → ▤</span>
          <h3>{emptyTitle}</h3>
          <p>{emptyDescription}</p>
        </div>
      )}
    </div>
  );
}
