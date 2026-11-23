import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  type AriaLabelConfig,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeTypes,
  type FitViewOptions,
  type Node,
  type NodeChange,
  type NodeTypes,
  type OnReconnect,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { orientConnection } from './connections';
import { useLanguage } from './language';
import { RelationshipMarkers, RelationshipTools, type RelationshipToolsProps } from './RelationshipTools';

type DiagramCanvasProps<NodeType extends Node> = {
  nodes: NodeType[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  edgeTypes?: EdgeTypes;
  classKey: string;
  active?: boolean;
  compact?: boolean;
  markerNamespace: string;
  relationships: RelationshipToolsProps['relationships'];
  relationshipTools?: Omit<RelationshipToolsProps, 'relationships'>;
  label: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  onNodesChange?: (changes: NodeChange<NodeType>[]) => void;
  onEdgesChange?: (changes: EdgeChange<Edge>[]) => void;
  onNodesDelete?: (nodes: NodeType[]) => void;
  onEdgesDelete?: (edges: Edge[]) => void;
  onConnect?: (connection: Connection) => void;
  onReconnect?: OnReconnect<Edge>;
  onNodeClick?: (event: MouseEvent, node: NodeType) => void;
  onPaneClick?: () => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
};

const compactFit = {
  padding: { x: '20px', y: '26px' },
  minZoom: 0.16,
  maxZoom: 0.9,
} satisfies FitViewOptions;

const russianDiagramLabels = {
  'node.a11yDescription.default': 'Нажмите Enter или пробел, чтобы выбрать карточку, Delete, чтобы удалить, или Esc, чтобы отменить выбор.',
  'node.a11yDescription.keyboardDisabled': 'Нажмите Enter или пробел, чтобы выбрать карточку. Используйте клавиши со стрелками для перемещения, Delete для удаления и Esc для отмены выбора.',
  'node.a11yDescription.ariaLiveMessage': ({ x, y }) => `Карточка перемещена. Новая позиция: x = ${x}, y = ${y}.`,
  'edge.a11yDescription.default': 'Нажмите Enter или пробел, чтобы выбрать связь, Delete, чтобы удалить, или Esc, чтобы отменить выбор.',
  'controls.ariaLabel': 'Управление диаграммой',
  'controls.zoomIn.ariaLabel': 'Увеличить масштаб',
  'controls.zoomOut.ariaLabel': 'Уменьшить масштаб',
  'controls.fitView.ariaLabel': 'Показать всю диаграмму',
} satisfies Partial<AriaLabelConfig>;
const englishDiagramLabels: Partial<AriaLabelConfig> = {};

export function ClassDiagramCanvas<NodeType extends Node>({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  classKey,
  active = true,
  compact = false,
  markerNamespace,
  relationships,
  relationshipTools,
  label,
  emptyTitle,
  emptyDescription,
  emptyAction,
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
}: DiagramCanvasProps<NodeType>)
{
  const language = useLanguage();
  const [flow, setFlow] = useState<ReactFlowInstance<NodeType> | null>(null);
  const editable = Boolean(relationshipTools);

  const dragStartNode = useRef<string | null>(null);
  const clickStartNode = useRef<string | null>(null);

  function handleConnect(connection: Connection)
  {
    onConnect?.(orientConnection(connection, dragStartNode.current ?? clickStartNode.current));
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
      void flow?.fitView(compact ? compactFit : { padding: 0.2, maxZoom: 0.9 });
    }, 100);

    return () => window.clearTimeout(timerId);
  }, [flow, classKey, active, compact]);

  return (
    <div className="pattern-canvas" aria-label={label} onDragOver={onDragOver} onDrop={onDrop}>
      <RelationshipMarkers relationships={relationships} namespace={markerNamespace} />
      <ReactFlow
        id={markerNamespace}
        ariaLabelConfig={language === 'ru' ? russianDiagramLabels : englishDiagramLabels}
        connectionMode={ConnectionMode.Loose}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={setFlow}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={editable ? handleConnect : undefined}
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
        nodesDraggable={editable && !relationshipTools?.drawing}
        nodesConnectable={editable}
        nodesFocusable={editable}
        edgesFocusable={editable}
        elementsSelectable={editable}
        deleteKeyCode={editable ? ['Backspace', 'Delete'] : null}
        minZoom={compact ? compactFit.minZoom : 0.25}
        maxZoom={1.5}
        defaultViewport={{ x: 30, y: 30, zoom: 0.65 }}
        colorMode="dark"
      >
        <Background gap={22} color="#314338" />
        <Controls position="bottom-right" showInteractive={false} fitViewOptions={compact ? compactFit : undefined} />
        {relationshipTools && <RelationshipTools relationships={relationships} {...relationshipTools} />}
      </ReactFlow>
      {nodes.length === 0 && emptyTitle && (
        <div className="pattern-empty">
          <span aria-hidden="true">▤ → ▤</span>
          <h3>{emptyTitle}</h3>
          {emptyDescription && <p>{emptyDescription}</p>}
          {emptyAction && <button type="button" onClick={emptyAction.onClick}>{emptyAction.label}</button>}
        </div>
      )}
    </div>
  );
}
