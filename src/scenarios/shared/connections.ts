export const connectionHandles = ['top', 'bottom', 'left', 'right'] as const;
export type ConnectionHandle = typeof connectionHandles[number];

export function isConnectionHandle(value: unknown): value is ConnectionHandle
{
  return typeof value === 'string'
    && connectionHandles.some(handle => handle === value);
}

export function normalizeConnectionHandle(value: unknown): ConnectionHandle | undefined
{
  if (isConnectionHandle(value))
  {
    return value;
  }

  if (typeof value !== 'string')
  {
    return undefined;
  }

  // Старые сохранения содержат точки вида side-start/end; приводим их к стороне.
  const matchedHandle = /^(top|bottom|left|right)-(start|end)$/.exec(value);
  if (!matchedHandle || !isConnectionHandle(matchedHandle[1]))
  {
    return undefined;
  }

  return matchedHandle[1];
}

export type DiagramConnection = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type DiagramRelationship = DiagramConnection & { type: string };

export function facingConnectionHandles(
  source: { x: number; y: number },
  target: { x: number; y: number },
): { sourceHandle: ConnectionHandle; targetHandle: ConnectionHandle }
{
  if (source.y === target.y)
  {
    return source.x < target.x
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left', targetHandle: 'right' };
  }

  return source.y < target.y
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top', targetHandle: 'bottom' };
}

export function orientConnection<Connection extends DiagramConnection>(
  connection: Connection,
  firstNodeId: string | null,
): Connection
{
  if (firstNodeId !== connection.target || connection.source === connection.target)
  {
    return connection;
  }

  return {
    ...connection,
    source: connection.target,
    target: connection.source,
    sourceHandle: connection.targetHandle,
    targetHandle: connection.sourceHandle,
  };
}

export function createDiagramRelationship(connection: DiagramConnection, type: string): DiagramRelationship
{
  return {
    source: connection.source,
    target: connection.target,
    type,
    sourceHandle: normalizeConnectionHandle(connection.sourceHandle) ?? connection.sourceHandle ?? 'bottom',
    targetHandle: normalizeConnectionHandle(connection.targetHandle) ?? connection.targetHandle ?? 'top',
  };
}
