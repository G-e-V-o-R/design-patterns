import { createDiagramRelationship, type DiagramRelationship } from './connections';
export type { DiagramRelationship } from './connections';
import { MarkerType, type Edge } from '@xyflow/react';

export type RelationshipDefinition = {
  id: string;
  label: string;
  toolLabel?: string;
  appearance?: 'solid' | 'implementation';
};

export function relationshipMarkerId(namespace: string, relationshipId: string, invalid = false)
{
  return `${namespace}-${relationshipId}-arrow${invalid ? '-invalid' : ''}`;
}

export function relationshipLabel(type: string, relationships: readonly RelationshipDefinition[])
{
  return relationships.find(item => item.id === type)?.label
    ?? (type ? `Unknown relationship: ${type}` : 'Unknown relationship type');
}

export function createRelationshipEdge(
  edge: DiagramRelationship,
  index: number,
  relationships: readonly RelationshipDefinition[],
  markerNamespace: string,
  selected = false,
  invalid = false,
): Edge
{
  const definition = relationships.find(item => item.id === edge.type);
  const isImplementation = definition?.appearance === 'implementation';
  const label = relationshipLabel(edge.type, relationships);

  const color = invalid ? '#ef9a87' : '#a7bba4';
  let strokeWidth = selected ? 4 : 1.6;
  if (invalid)
  {
    strokeWidth = selected ? 4.5 : 3;
  }

  return {
    ...createDiagramRelationship(edge, edge.type),
    id: String(index),
    selected,
    type: 'smoothstep',
    label,
    className: invalid ? 'is-invalid' : undefined,
    labelStyle: invalid ? { fill: '#ffe0d7' } : undefined,
    labelBgStyle: invalid ? { fill: '#613b35' } : undefined,
    markerEnd: isImplementation
      ? relationshipMarkerId(markerNamespace, edge.type, invalid)
      : { type: MarkerType.ArrowClosed, color },
    style: {
      stroke: color,
      strokeWidth,
      strokeDasharray: isImplementation ? '6 4' : undefined,
    },
  };
}
