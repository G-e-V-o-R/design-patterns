import { Blueprint, Edge, Graph } from '../domain/blueprints/types';

export interface SimulationResult { trace: string[]; reachedRoles: string[] }
export function simulateBlueprint(blueprint: Blueprint, graph: Graph): SimulationResult {
  const trace: string[] = [];
  const reached = new Set<string>();
  const label = (id: string): string => blueprint.roles.find(r => r.id === id)?.label ?? id;
  const has = (edge: Edge): boolean => graph.roles.includes(edge.source) && graph.roles.includes(edge.target)
    && graph.edges.some(e => e.source === edge.source && e.target === edge.target && e.type === edge.type);
  for (const example of blueprint.simulations) {
    trace.push(example.input + '.');
    // Subscription edges are independent listeners, not a sequential delivery path.
    if (blueprint.pattern === 'Observer') {
      for (const edge of example.path) {
        if (has(edge)) {
          trace.push(`${label(edge.target)} → ${label(edge.source)}: the discovery arrives; ${label(edge.source)} chooses a response.`);
          reached.add(edge.source);
        } else trace.push(`${label(edge.source)} receives nothing: their bracelet is not listening to ${label(edge.target)}.`);
      }
    } else {
      let delivered = true;
      for (const edge of example.path) {
        if (!has(edge)) {
          trace.push(`${label(edge.source)} cannot send ${example.input} to ${label(edge.target)}: the ${edge.type} link is missing.`);
          delivered = false;
          break;
        }
        trace.push(`${label(edge.source)} → ${label(edge.target)}: ${example.input}.`);
      }
      if (delivered) for (const id of example.recipients) {
        trace.push(`${label(id)} responds to the request for ${example.input}.`);
        reached.add(id);
      }
    }
  }
  return { trace, reachedRoles: [...reached] };
}
