import { BaseEdge, Position, type Edge, type EdgeProps, type EdgeTypes } from '@xyflow/react';

type ParallelEdge = Edge<{ offset: number }, 'parallelRelationship'>;

export function spaceParallelRelationships(edges: Edge[]): Edge[]
{
  const routes = new Map<string, { index: number; direction: number }[]>();
  edges.forEach((edge, index) =>
  {
    const source = JSON.stringify([edge.source, edge.sourceHandle]);
    const target = JSON.stringify([edge.target, edge.targetHandle]);
    const forward = source < target;
    const key = JSON.stringify(forward ? [source, target] : [target, source]);
    const route = routes.get(key) ?? [];
    route.push({ index, direction: forward ? 1 : -1 });
    routes.set(key, route);
  });

  for (const route of routes.values())
  {
    if (route.length < 2)
    {
      continue;
    }
    const center = (route.length - 1) / 2;
    route.forEach(({ index, direction }, lane) =>
    {
      edges[index] = { ...edges[index]!, type: 'parallelRelationship', data: { offset: (lane - center) * 86 * direction } };
    });
  }
  return edges;
}

function ParallelRelationshipEdge({
  sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data, id, style, markerEnd, interactionWidth,
  label, labelStyle, labelBgStyle, labelShowBg, labelBgPadding, labelBgBorderRadius,
}: EdgeProps<ParallelEdge>)
{
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.hypot(dx, dy) || 1;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const offset = data?.offset ?? 0;
  let bendX = -dy * offset / distance;
  let bendY = dx * offset / distance;
  if (sourcePosition === Position.Top && targetPosition === Position.Bottom
    || sourcePosition === Position.Bottom && targetPosition === Position.Top)
  {
    bendX = sourcePosition === Position.Top ? offset : -offset;
    bendY = 0;
  }
  else if (sourcePosition === Position.Left && targetPosition === Position.Right
    || sourcePosition === Position.Right && targetPosition === Position.Left)
  {
    bendX = 0;
    bendY = sourcePosition === Position.Right ? offset : -offset;
  }
  const path = `M ${sourceX},${sourceY} Q ${midX + 2 * bendX},${midY + 2 * bendY} ${targetX},${targetY}`;

  return (
    <BaseEdge
      id={id}
      path={path}
      labelX={midX + bendX}
      labelY={midY + bendY}
      label={label}
      style={style}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      labelStyle={labelStyle}
      labelBgStyle={labelBgStyle}
      labelShowBg={labelShowBg}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
    />
  );
}

export const parallelRelationshipEdgeTypes = { parallelRelationship: ParallelRelationshipEdge } satisfies EdgeTypes;
