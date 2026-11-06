export const connectionHandles = ['top', 'bottom', 'left', 'right'] as const;
export type ConnectionHandle = typeof connectionHandles[number];
export function isConnectionHandle(value: unknown): value is ConnectionHandle {
  return typeof value === 'string' && connectionHandles.some(handle => handle === value);
}

export function normalizeConnectionHandle(value: unknown): ConnectionHandle | undefined {
  if (isConnectionHandle(value)) return value;
  if (typeof value !== 'string') return undefined;
  const match = /^(top|bottom|left|right)-(start|end)$/.exec(value);
  return match && isConnectionHandle(match[1]) ? match[1] : undefined;
}

/** The first lesson models class structure; runtime subscription is shown in the trace. */
export type LessonGraph = {
  classes: string[];
  members: Record<string, string>;
  edges: { source: string; target: string; type: string; sourceHandle?: ConnectionHandle; targetHandle?: ConnectionHandle }[];
};
export const classCards = [
  { id: 'publisher', label: 'FoxPublisher', kind: 'class · Publisher', description: 'Looks for danger and keeps a list of subscribers. Sends what it sees through the Subscriber interface only when there is danger.' },
  { id: 'subscriber', label: 'Subscriber', kind: 'interface', description: 'An interface with update(discovery). Every subscriber must implement this method to get messages.' },
  { id: 'narion', label: 'NarionSubscriber', kind: 'class · Concrete subscriber', description: 'Implements Subscriber. Gets the message and helps Narion plan a safer path.' },
  { id: 'dre-kaar', label: 'DreKaarSubscriber', kind: 'class · Concrete subscriber', description: 'Implements Subscriber. Gets the same message and helps Dre’Kaar protect the group.' },
];
export const memberCards = [
  { kind: 'field', id: 'subscribers', label: 'subscribers: Subscriber[]', description: 'The list of active subscribers who get the fox’s messages.' },
  { kind: 'method', id: 'subscribe', label: 'subscribe(s: Subscriber)', description: 'Add a subscriber to the subscribers field so they can get messages.' },
  { kind: 'method', id: 'unsubscribe', label: 'unsubscribe(s: Subscriber)', description: 'Remove a subscriber from the subscribers field so they get no more messages.' },
  { kind: 'method', id: 'notify', label: 'notify()', description: 'Read the subscribers field and call update(discovery) on each subscriber.' },
  { kind: 'method', id: 'discover', label: 'discoverDanger() · business logic', description: 'When the fox finds danger, save what it sees and call notify(). Send no message when the path is safe.' },
  { kind: 'method', id: 'update-contract', label: 'update(discovery) · contract', description: 'Put this method in the interface. Each subscriber must implement it. The interface has no code for the method.' },
  { kind: 'method', id: 'narion-update', label: 'update(discovery) · Narion', description: 'Get the message and call planRoute() for Narion.' },
  { kind: 'method', id: 'narion-logic', label: 'planRoute() · business logic', description: 'Narion uses the message to choose a safer path.' },
  { kind: 'method', id: 'dre-update', label: 'update(discovery) · Dre’Kaar', description: 'Get the message and call prepareDefense() for Dre’Kaar.' },
  { kind: 'method', id: 'dre-logic', label: 'prepareDefense() · business logic', description: 'Dre’Kaar gets ready to protect the group.' },
];
export const relationshipKinds = [
  { id: 'stores', label: 'stores subscribers: Subscriber[]' },
  { id: 'implements', label: 'implements interface' },
];
export function emptyLesson(): LessonGraph { return { classes: [], members: {}, edges: [] }; }
export function solutionLesson(): LessonGraph {
  return {
    classes: classCards.map(c => c.id),
    members: { subscribers: 'publisher', subscribe: 'publisher', unsubscribe: 'publisher', notify: 'publisher', discover: 'publisher', 'update-contract': 'subscriber', 'narion-update': 'narion', 'narion-logic': 'narion', 'dre-update': 'dre-kaar', 'dre-logic': 'dre-kaar' },
    edges: [
      { source: 'publisher', target: 'subscriber', type: 'stores' },
      { source: 'narion', target: 'subscriber', type: 'implements' },
      { source: 'dre-kaar', target: 'subscriber', type: 'implements' },
    ],
  };
}
const edgeKey = (e: LessonGraph['edges'][number]) => `${e.source}:${e.type}:${e.target}`;
const label = (id: string) => classCards.find(c => c.id === id)?.label ?? id;
export function validateLesson(graph: LessonGraph): string[] {
  const expected = solutionLesson();
  const issues: string[] = [];
  for (const card of classCards) if (!graph.classes.includes(card.id)) issues.push(`Add the ${card.label} ${card.id === 'subscriber' ? 'interface' : 'class'} card.`);
  if (new Set(graph.classes).size !== graph.classes.length || graph.classes.some(id => !expected.classes.includes(id))) issues.push('Use each class card once.');
  for (const card of memberCards) {
    const owner = graph.members[card.id];
    if (!owner) issues.push(`Place ${card.label} in a class or interface.`);
    else if (owner !== expected.members[card.id]) issues.push(`${card.label} belongs in ${label(expected.members[card.id]!)}. ${card.description}`);
  }
  for (const [id, owner] of Object.entries(graph.members)) {
    if (!memberCards.some(c => c.id === id)) issues.push('Remove the unknown member card.');
    if (!graph.classes.includes(owner)) issues.push(`Add ${label(owner)} before adding its fields or methods.`);
  }
  for (const edge of expected.edges) if (!graph.edges.some(e => edgeKey(e) === edgeKey(edge))) {
    issues.push(edge.type === 'stores' ? 'FoxPublisher must keep a list of Subscriber. Connect it to the Subscriber interface.' : `${label(edge.source)} must implement the Subscriber interface.`);
  }
  const seen = new Set<string>();
  for (const edge of graph.edges) {
    const key = edgeKey(edge);
    if (!expected.edges.some(e => edgeKey(e) === key)) issues.push(`Review ${label(edge.source)} → ${label(edge.target)}: the publisher keeps a list of Subscriber. Concrete subscribers implement that interface.`);
    if (seen.has(key)) issues.push('This relationship is here twice. Remove one copy.');
    seen.add(key);
  }
  return issues;
}
export function simulateLesson(graph: LessonGraph): string[] {
  if (validateLesson(graph).length) return ['The diagram is not ready. Read the messages and fix the diagram. Then run the discovery again.'];
  return [
    'First, create a FoxPublisher, a NarionSubscriber, and a DreKaarSubscriber.',
    'Narion and Dre’Kaar put on their bracelets. Call fox.subscribe(narion) and fox.subscribe(dreKaar). The fox stores both in its subscribers field.',
    'The fox checks the path. If it is safe, it sends no message. When it sees danger, FoxPublisher.discoverDanger() saves “Danger ahead” and calls notify(). This is its business logic.',
    'notify() reads the subscribers field. It calls update(discovery) through the Subscriber interface to send each subscriber the same message.',
    'NarionSubscriber.update(discovery) calls planRoute(): Narion chooses a safer route.',
    'DreKaarSubscriber.update(discovery) calls prepareDefense(): Dre’Kaar gets ready to protect the group.',
    'Narion takes off his bracelet. Call fox.unsubscribe(narion) to remove him from the subscribers field. The fox keeps checking the path. Only Dre’Kaar gets its next danger message.',
    'A new friend can implement Subscriber and subscribe. FoxPublisher needs no changes.',
  ];
}
/** Accept incomplete learning attempts, but reject malformed or foreign saved data. */
export function parseLesson(raw: string | null): LessonGraph {
  if (!raw || raw.length > 50000) return emptyLesson();
  try {
    const g: unknown = JSON.parse(raw);
    if (!g || typeof g !== 'object') return emptyLesson();
    const v = g as Record<string, unknown>;
    if (!Array.isArray(v.classes) || !v.classes.every(id => typeof id === 'string' && classCards.some(c => c.id === id)) || new Set(v.classes).size !== v.classes.length) return emptyLesson();
    if (!v.members || typeof v.members !== 'object' || Array.isArray(v.members)) return emptyLesson();
    if (!Object.entries(v.members).every(([id, owner]) => memberCards.some(c => c.id === id) && typeof owner === 'string' && (v.classes as string[]).includes(owner))) return emptyLesson();
    if (!Array.isArray(v.edges) || v.edges.length > 24 || !v.edges.every(e => e && typeof e === 'object' && v.classes instanceof Array && v.classes.includes(e.source) && v.classes.includes(e.target) && e.source !== e.target && relationshipKinds.some(k => k.id === e.type))) return emptyLesson();
    if (!v.edges.every(e => [e.sourceHandle, e.targetHandle].every(handle => handle === undefined || normalizeConnectionHandle(handle) !== undefined))) return emptyLesson();
    const graph = v as unknown as LessonGraph;
    if (new Set(graph.edges.map(edgeKey)).size !== graph.edges.length) return emptyLesson();
    return { classes: [...graph.classes], members: { ...graph.members }, edges: graph.edges.map(({source,target,type,sourceHandle,targetHandle}) => ({source,target,type,...(sourceHandle ? {sourceHandle: normalizeConnectionHandle(sourceHandle)} : {}),...(targetHandle ? {targetHandle: normalizeConnectionHandle(targetHandle)} : {})})) };
  } catch { return emptyLesson(); }
}
