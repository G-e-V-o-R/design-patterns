export type ChainGraph = {
  classes: string[];
  members: Record<string, string>;
  edges: { source: string; target: string; type: string }[];
};

export const classCards = [
  {
    id: 'handler',
    label: 'SignalHandler',
    kind: 'interface',
    description: 'Defines the shared request contract. Each spider can decide whether it handles the signal or passes it onward.',
  },
  {
    id: 'thread',
    label: 'SilkThread',
    kind: 'base handler',
    description: 'Keeps a next link and forwards requests through the chain.',
  },
  {
    id: 'blood',
    label: 'BloodSpider',
    kind: 'concrete handler',
    description: 'Recognizes blood-trail requests and stops the chain when the scent matches.',
  },
  {
    id: 'step',
    label: 'StepSpider',
    kind: 'concrete handler',
    description: 'Tracks goblin footsteps and handles the request when the signal matches its branch.',
  },
  {
    id: 'iron',
    label: 'IronSpider',
    kind: 'concrete handler',
    description: 'Responds to iron and mercenary signals, finishing the chain when its target is found.',
  },
];

export const memberCards = [
  {
    id: 'handle-contract',
    kind: 'method',
    label: 'handle(request) · contract',
    owner: 'handler',
    description: 'The interface contract all handlers implement.',
  },
  {
    id: 'next',
    kind: 'field',
    label: 'next: SignalHandler',
    owner: 'thread',
    description: 'The next handler in the decision chain.',
  },
  {
    id: 'forward',
    kind: 'method',
    label: 'forward(request)',
    owner: 'thread',
    description: 'Pass the signal to the next handler if the current one cannot act.',
  },
  {
    id: 'blood-handle',
    kind: 'method',
    label: 'handle(request) · blood',
    owner: 'blood',
    description: 'A blood spider reacts when the signal smells of orcs.',
  },
  {
    id: 'step-handle',
    kind: 'method',
    label: 'handle(request) · step',
    owner: 'step',
    description: 'A step spider reacts when the signal matches goblin movement.',
  },
  {
    id: 'iron-handle',
    kind: 'method',
    label: 'handle(request) · iron',
    owner: 'iron',
    description: 'An iron spider reacts when the signal matches a mercenary trail.',
  },
];

export const relationshipKinds = [
  {
    id: 'implements',
    label: 'implements the interface',
    description: 'Concrete handler → Handler: follows the same request contract.',
  },
  {
    id: 'next',
    label: 'next in chain',
    description: 'Current handler → next handler: passes the request along.',
  },
];

export function getClassLabel(classId: string)
{
  return classCards.find(card => card.id === classId)?.label ?? classId;
}

export const classLabel = getClassLabel;

export const edgeKey = (edge: ChainGraph['edges'][number]) => `${edge.source}:${edge.type}:${edge.target}`;

export function emptyLesson(): ChainGraph
{
  return { classes: [], members: {}, edges: [] };
}

export function solutionLesson(): ChainGraph
{
  return {
    classes: classCards.map(card => card.id),
    members: {
      'handle-contract': 'handler',
      next: 'thread',
      forward: 'thread',
      'blood-handle': 'blood',
      'step-handle': 'step',
      'iron-handle': 'iron',
    },
    edges: [
      { source: 'thread', target: 'handler', type: 'implements' },
      { source: 'blood', target: 'handler', type: 'implements' },
      { source: 'step', target: 'handler', type: 'implements' },
      { source: 'iron', target: 'handler', type: 'implements' },
      { source: 'thread', target: 'blood', type: 'next' },
      { source: 'blood', target: 'step', type: 'next' },
      { source: 'step', target: 'iron', type: 'next' },
    ],
  };
}

export type ChainIssue = {
  message: string;
  classIds: string[];
  memberIds: string[];
  edgeIndices: number[];
};

export function getLessonIssues(graph: ChainGraph): ChainIssue[]
{
  const issues: ChainIssue[] = [];
  const add = (
    message: string,
    classIds: string[] = [],
    memberIds: string[] = [],
    edgeIndices: number[] = [],
  ) => issues.push({ message, classIds, memberIds, edgeIndices });
  const expected = solutionLesson();

  for (const card of classCards)
  {
    if (!graph.classes.includes(card.id))
    {
      const label = card.id === 'handler' ? 'interface' : 'handler';
      add(`Add the ${card.label} ${label} card.`, [card.id]);
    }
  }

  const hasDuplicateClass = new Set(graph.classes).size !== graph.classes.length;
  const hasUnknownClass = graph.classes.some(id => !expected.classes.includes(id));
  if (hasDuplicateClass || hasUnknownClass)
  {
    add('Use each class card once.', graph.classes);
  }

  for (const card of memberCards)
  {
    const owner = graph.members[card.id];
    if (!owner)
    {
      add(`Place ${card.label} in ${getClassLabel(card.owner)}.`, [card.owner], [card.id]);
    }
    else if (owner !== card.owner)
    {
      add(
        `${card.label} belongs in ${getClassLabel(card.owner)}. ${card.description}`,
        [owner, card.owner],
        [card.id],
      );
    }
  }

  for (const [id, owner] of Object.entries(graph.members))
  {
    if (!memberCards.some(card => card.id === id))
    {
      add('Remove this unknown member.', [owner], [id]);
    }

    if (!graph.classes.includes(owner))
    {
      add(`Add ${getClassLabel(owner)} before assigning its members.`, [owner], [id]);
    }
  }

  for (const edge of expected.edges)
  {
    const exists = graph.edges.some(candidate => edgeKey(candidate) === edgeKey(edge));
    if (!exists)
    {
      const relationshipLabel = relationshipKinds.find(kind => kind.id === edge.type)?.label ?? edge.type;
      add(
        `Connect ${getClassLabel(edge.source)} → ${getClassLabel(edge.target)} with “${relationshipLabel}”.`,
        [edge.source, edge.target],
      );
    }
  }

  const seen = new Map<string, number>();
  graph.edges.forEach((edge, index) =>
  {
    const key = edgeKey(edge);
    const isExpected = expected.edges.some(candidate => edgeKey(candidate) === key);
    if (!isExpected)
    {
      add(
        `Review ${getClassLabel(edge.source)} → ${getClassLabel(edge.target)}. The chain should pass requests through next links and follow the shared handler interface.`,
        [edge.source, edge.target],
        [],
        [index],
      );
    }

    if (seen.has(key))
    {
      add(
        'Remove the duplicate relationship.',
        [edge.source, edge.target],
        [],
        [seen.get(key)!, index],
      );
    }

    seen.set(key, index);
  });

  return issues;
}

export const validateLesson = (graph: ChainGraph) => getLessonIssues(graph).map(issue => issue.message);

export type RequestKind = 'blood' | 'step' | 'iron' | 'safe';

export type ChainResult = {
  request: RequestKind;
  handler: string;
  summary: string;
  trace: string[];
};

export function simulateLesson(
  graph: ChainGraph,
  request: RequestKind,
): ChainResult | null
{
  if (getLessonIssues(graph).length)
  {
    return null;
  }

  const requestToHandler: Record<RequestKind, string> = {
    blood: 'blood',
    step: 'step',
    iron: 'iron',
    safe: 'none',
  };

  const chosen = requestToHandler[request];
  if (chosen === 'none')
  {
    return {
      request,
      handler: 'none',
      summary: 'No spider recognizes the scent, so the chain ends without acting.',
      trace: [
        'Faelina sends a calm signal through the chain.',
        'SilkThread forwards the signal to BloodSpider.',
        'BloodSpider rejects the request and lets it continue.',
        'StepSpider rejects the request and lets it continue.',
        'IronSpider rejects the request. The chain stops without acting.',
      ],
    };
  }

  return {
    request,
    handler: chosen,
    summary: `${getClassLabel(chosen)} accepts the request and stops the chain.`,
    trace: [
      `Faelina sends the “${request}” signal through the responsible chain.`,
      `SilkThread forwards it to ${getClassLabel(chosen)}.`,
      `${getClassLabel(chosen)} recognizes the signal and handles it immediately.`,
      'The remaining spiders never receive the request, because the chain stops here.',
    ],
  };
}

export const hints = [
  'Start with a shared handler interface. All spider classes should implement the same request contract.',
  'Give the chain base handler a next reference. That is the real difference from a flat list of unrelated spiders.',
  'Use a next link from the thread to each spider and between the spiders in order: blood → step → iron.',
];
