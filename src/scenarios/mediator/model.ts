/** Mediator owns its graph contract; it deliberately imports no other scenario. */
export type MediatorGraph = {
  classes: string[];
  members: Record<string, string>;
  edges: { source: string; target: string; type: string }[];
};
export const classCards = [
  { id: 'mediator', label: 'Mediator', kind: 'interface', description: 'The contract companions use to report a request.' },
  { id: 'raven', label: 'RavenMediator', kind: 'concrete mediator', description: 'Knows the companions and chooses who should handle each request.' },
  { id: 'dre-kaar', label: 'DreKaar', kind: 'participant', description: 'Asks the mediator for cover without knowing who will provide it.' },
  { id: 'narion', label: 'Narion', kind: 'participant', description: 'Provides covering fire when the raven asks.' },
  { id: 'faelina', label: 'Faelina', kind: 'participant', description: 'Asks the mediator for shelter without contacting a companion directly.' },
  { id: 'saerenn', label: 'Saerenn', kind: 'participant', description: 'Provides shelter when the raven asks.' },
];
export const memberCards = [
  { id: 'notify-contract', kind: 'method', label: 'notify(sender, request) · contract', owner: 'mediator', description: 'Declare how participants contact the mediator.' },
  { id: 'notify-routing', kind: 'method', label: 'notify(sender, request) · routing', owner: 'raven', description: 'Choose Narion for cover and Saerenn for shelter.' },
  { id: 'participants', kind: 'field', label: 'participants: Companions', owner: 'raven', description: 'References to the four participants, supplied when the raven is created.' },
  ...['dre-kaar', 'narion', 'faelina', 'saerenn'].map(id => ({ id: `${id}-mediator`, kind: 'field', label: `mediator: Mediator · ${classCards.find(c => c.id === id)!.label}`, owner: id, description: 'Hold the Mediator interface, not references to peer participants.' })),
  { id: 'request-cover', kind: 'method', label: 'requestCover()', owner: 'dre-kaar', description: 'Call mediator.notify(this, "cover").' },
  { id: 'provide-cover', kind: 'method', label: 'provideCover()', owner: 'narion', description: 'Narion’s business logic: shoot to cover the group.' },
  { id: 'request-shelter', kind: 'method', label: 'requestShelter()', owner: 'faelina', description: 'Call mediator.notify(this, "shelter").' },
  { id: 'provide-shelter', kind: 'method', label: 'provideShelter()', owner: 'saerenn', description: 'Saerenn’s business logic: guide the group into shelter.' },
];
export const relationshipKinds = [
  { id: 'uses', label: 'uses mediator', description: 'Participant → Mediator: holds the interface reference.' },
  { id: 'implements', label: 'implements', description: 'RavenMediator → Mediator: implements the contract.' },
  { id: 'knows', label: 'knows participant', description: 'RavenMediator → participant: can coordinate that companion.' },
];
export const classLabel = (id: string) => classCards.find(card => card.id === id)?.label ?? id;
export const edgeKey = (edge: MediatorGraph['edges'][number]) => `${edge.source}:${edge.type}:${edge.target}`;
export function emptyLesson(): MediatorGraph { return { classes: [], members: {}, edges: [] }; }
export function solutionLesson(): MediatorGraph {
  return {
    classes: classCards.map(card => card.id),
    members: Object.fromEntries(memberCards.map(card => [card.id, card.owner])),
    edges: [
      { source: 'raven', target: 'mediator', type: 'implements' },
      ...classCards.filter(card => card.kind === 'participant').flatMap(card => [
        { source: card.id, target: 'mediator', type: 'uses' },
        { source: 'raven', target: card.id, type: 'knows' },
      ]),
    ],
  };
}
export type MediatorIssue = { message: string; classIds: string[]; memberIds: string[]; edgeIndices: number[] };
export function getLessonIssues(graph: MediatorGraph): MediatorIssue[] {
  const issues: MediatorIssue[] = [];
  const add = (message: string, classIds: string[] = [], memberIds: string[] = [], edgeIndices: number[] = []) => issues.push({ message, classIds, memberIds, edgeIndices });
  const expected = solutionLesson();
  for (const card of classCards) if (!graph.classes.includes(card.id)) add(`Add ${card.label}.`, [card.id]);
  if (new Set(graph.classes).size !== graph.classes.length || graph.classes.some(id => !expected.classes.includes(id))) add('Use each of the six class/interface cards once.', graph.classes);
  for (const card of memberCards) {
    const owner = graph.members[card.id];
    if (!owner) add(`Place ${card.label} in ${classLabel(card.owner)}.`, [card.owner], [card.id]);
    else if (owner !== card.owner) add(`${card.label} belongs in ${classLabel(card.owner)}. ${card.description}`, [owner, card.owner], [card.id]);
  }
  for (const [id, owner] of Object.entries(graph.members)) {
    if (!memberCards.some(card => card.id === id)) add('Remove this unknown member.', [owner], [id]);
    if (!graph.classes.includes(owner)) add(`Add ${classLabel(owner)} before assigning its members.`, [owner], [id]);
  }
  for (const edge of expected.edges) if (!graph.edges.some(candidate => edgeKey(candidate) === edgeKey(edge))) {
    add(`Connect ${classLabel(edge.source)} → ${classLabel(edge.target)} with “${relationshipKinds.find(kind => kind.id === edge.type)!.label}”.`, [edge.source, edge.target]);
  }
  const seen = new Map<string, number>();
  graph.edges.forEach((edge, index) => {
    const key = edgeKey(edge);
    if (!expected.edges.some(candidate => edgeKey(candidate) === key)) add(`Review ${classLabel(edge.source)} → ${classLabel(edge.target)}. Participants use Mediator; RavenMediator knows the participants and implements Mediator.`, [edge.source, edge.target], [], [index]);
    if (seen.has(key)) add('Remove the duplicate relationship.', [edge.source, edge.target], [], [seen.get(key)!, index]);
    seen.set(key, index);
  });
  return issues;
}
export const validateLesson = (graph: MediatorGraph) => getLessonIssues(graph).map(issue => issue.message);
export type RequestKind = 'cover' | 'shelter';
export type CoordinationResult = { request: RequestKind; sender: string; recipient: string; summary: string; trace: string[] };
export function simulateLesson(graph: MediatorGraph, request: RequestKind): CoordinationResult | null {
  if (getLessonIssues(graph).length) return null;
  const cover = request === 'cover';
  const sender = cover ? 'dre-kaar' : 'faelina';
  const recipient = cover ? 'narion' : 'saerenn';
  return {
    request, sender, recipient,
    summary: cover ? 'Only Narion receives the cover request and provides covering fire.' : 'Only Saerenn receives the shelter request and guides the group to safety.',
    trace: [
      `${classLabel(sender)}.${cover ? 'requestCover' : 'requestShelter'}() calls mediator.notify(this, "${request}").`,
      `RavenMediator.notify(sender, "${request}") selects ${classLabel(recipient)} using its coordination rule.`,
      `RavenMediator calls ${classLabel(recipient)}.${cover ? 'provideCover' : 'provideShelter'}().`,
      `${classLabel(recipient)} performs its own business logic. The other participants receive no request.`,
    ],
  };
}
export const hints = [
  'Give each participant a mediator: Mediator field. A participant asks through the interface, without knowing which companion will help.',
  'Mediator declares notify(sender, request). RavenMediator implements it, stores participant references, and owns the routing decisions.',
  'Draw four uses arrows to Mediator, one implements arrow from RavenMediator, and four knows arrows from RavenMediator to the participants. No participant needs a direct link to another.',
];
