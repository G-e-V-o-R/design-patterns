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

/** Урок моделирует структуру классов; выполнение подписки показано в трассе. */
export type LessonGraph = {
  classes: string[];
  members: Record<string, string>;
  edges: {
    source: string;
    target: string;
    type: string;
    sourceHandle?: ConnectionHandle;
    targetHandle?: ConnectionHandle;
  }[];
};

export const classCards = [
  {
    id: 'publisher',
    label: 'FoxPublisher',
    kind: 'class · Publisher',
    description: 'Looks for danger and keeps a list of subscribers. Sends what it sees through the Subscriber interface only when there is danger.',
  },
  {
    id: 'subscriber',
    label: 'Subscriber',
    kind: 'interface',
    description: 'An interface with update(discovery). Every subscriber must implement this method to get messages.',
  },
  {
    id: 'narion',
    label: 'NarionSubscriber',
    kind: 'class · Concrete subscriber',
    description: 'Implements Subscriber. Gets the message and helps Narion plan a safer path.',
  },
  {
    id: 'dre-kaar',
    label: 'DreKaarSubscriber',
    kind: 'class · Concrete subscriber',
    description: 'Implements Subscriber. Gets the same message and helps Dre’Kaar protect the group.',
  },
];

export const memberCards = [
  {
    kind: 'field',
    id: 'subscribers',
    label: 'subscribers: Subscriber[]',
    description: 'The list of active subscribers who get the fox’s messages.',
  },
  {
    kind: 'method',
    id: 'subscribe',
    label: 'subscribe(s: Subscriber)',
    description: 'Add a subscriber to the subscribers field so they can get messages.',
  },
  {
    kind: 'method',
    id: 'unsubscribe',
    label: 'unsubscribe(s: Subscriber)',
    description: 'Remove a subscriber from the subscribers field so they get no more messages.',
  },
  {
    kind: 'method',
    id: 'notify',
    label: 'notify()',
    description: 'Read the subscribers field and call update(discovery) on each subscriber.',
  },
  {
    kind: 'method',
    id: 'discover',
    label: 'discoverDanger() · business logic',
    description: 'When the fox finds danger, save what it sees and call notify(). Send no message when the path is safe.',
  },
  {
    kind: 'method',
    id: 'update-contract',
    label: 'update(discovery) · contract',
    description: 'Put this method in the interface. Each subscriber must implement it. The interface has no code for the method.',
  },
  {
    kind: 'method',
    id: 'narion-update',
    label: 'update(discovery) · Narion',
    description: 'Get the message and call planRoute() for Narion.',
  },
  {
    kind: 'method',
    id: 'narion-logic',
    label: 'planRoute() · business logic',
    description: 'Narion uses the message to choose a safer path.',
  },
  {
    kind: 'method',
    id: 'dre-update',
    label: 'update(discovery) · Dre’Kaar',
    description: 'Get the message and call prepareDefense() for Dre’Kaar.',
  },
  {
    kind: 'method',
    id: 'dre-logic',
    label: 'prepareDefense() · business logic',
    description: 'Dre’Kaar gets ready to protect the group.',
  },
];

export const relationshipKinds = [
  {
    id: 'stores',
    label: 'stores subscribers: Subscriber[]',
  },
  {
    id: 'implements',
    label: 'implements interface',
  },
];

export function emptyLesson(): LessonGraph
{
  return { classes: [], members: {}, edges: [] };
}

export function solutionLesson(): LessonGraph
{
  return {
    classes: classCards.map(classCard => classCard.id),
    members: {
      subscribers: 'publisher',
      subscribe: 'publisher',
      unsubscribe: 'publisher',
      notify: 'publisher',
      discover: 'publisher',
      'update-contract': 'subscriber',
      'narion-update': 'narion',
      'narion-logic': 'narion',
      'dre-update': 'dre-kaar',
      'dre-logic': 'dre-kaar',
    },
    edges: [
      { source: 'publisher', target: 'subscriber', type: 'stores' },
      { source: 'narion', target: 'subscriber', type: 'implements' },
      { source: 'dre-kaar', target: 'subscriber', type: 'implements' },
    ],
  };
}

function getEdgeKey(edge: LessonGraph['edges'][number])
{
  return JSON.stringify([edge.source, edge.type, edge.target]);
}

export function removeLessonEdgesAtIndices(
  graph: LessonGraph,
  edgeIndices: number[],
): LessonGraph
{
  const indicesToRemove = new Set(edgeIndices);
  if (indicesToRemove.size === 0)
  {
    return graph;
  }

  return {
    ...graph,
    edges: graph.edges.filter((_, edgeIndex) =>
      !indicesToRemove.has(edgeIndex)),
  };
}

function getClassLabel(classId: string)
{
  const matchingCard = classCards.find(classCard => classCard.id === classId);
  if (matchingCard)
  {
    return matchingCard.label;
  }

  return classId;
}

export type LessonIssue = {
  message: string;
  classIds: string[];
  memberIds: string[];
  edgeIndices: number[];
};

export function getLessonIssues(graph: LessonGraph): LessonIssue[]
{
  const expectedGraph = solutionLesson();
  const issues: LessonIssue[] = [];

  function addIssue(
    message: string,
    classIds: string[] = [],
    memberIds: string[] = [],
    edgeIndices: number[] = [],
  )
  {
    issues.push({ message, classIds, memberIds, edgeIndices });
  }

  for (const classCard of classCards)
  {
    if (!graph.classes.includes(classCard.id))
    {
      let classType = 'class';
      if (classCard.id === 'subscriber')
      {
        classType = 'interface';
      }

      addIssue(`Add the ${classCard.label} ${classType} card.`, [classCard.id]);
    }
  }

  const uniqueClassIds = new Set(graph.classes);
  const hasUnknownClass = graph.classes.some(classId =>
    !expectedGraph.classes.includes(classId));
  if (uniqueClassIds.size !== graph.classes.length || hasUnknownClass)
  {
    addIssue('Use each class card once.', graph.classes);
  }

  for (const memberCard of memberCards)
  {
    const assignedClassId = graph.members[memberCard.id];
    const expectedClassId = expectedGraph.members[memberCard.id]!;

    if (!assignedClassId)
    {
      addIssue(
        `Place ${memberCard.label} in a class or interface.`,
        [expectedClassId],
        [memberCard.id],
      );
    }
    else if (assignedClassId !== expectedClassId)
    {
      addIssue(
        `${memberCard.label} belongs in ${getClassLabel(expectedClassId)}. ${memberCard.description}`,
        [assignedClassId, expectedClassId],
        [memberCard.id],
      );
    }
  }

  for (const [memberId, assignedClassId] of Object.entries(graph.members))
  {
    const isKnownMember = memberCards.some(memberCard => memberCard.id === memberId);
    if (!isKnownMember)
    {
      addIssue('Remove the unknown member card.', [assignedClassId], [memberId]);
    }

    if (!graph.classes.includes(assignedClassId))
    {
      addIssue(
        `Add ${getClassLabel(assignedClassId)} before adding its fields or methods.`,
        [assignedClassId],
        [memberId],
      );
    }
  }

  for (const expectedEdge of expectedGraph.edges)
  {
    const relationshipIsPresent = graph.edges.some(edge =>
      getEdgeKey(edge) === getEdgeKey(expectedEdge));
    if (relationshipIsPresent)
    {
      continue;
    }

    if (expectedEdge.type === 'stores')
    {
      addIssue(
        'FoxPublisher must keep a list of Subscriber. Connect it to the Subscriber interface.',
        [expectedEdge.source, expectedEdge.target],
      );
    }
    else
    {
      addIssue(
        `${getClassLabel(expectedEdge.source)} must implement the Subscriber interface.`,
        [expectedEdge.source, expectedEdge.target],
      );
    }
  }

  const seenEdges = new Map<string, number>();
  graph.edges.forEach((edge, edgeIndex) =>
  {
    const edgeKey = getEdgeKey(edge);
    const isExpectedEdge = expectedGraph.edges.some(expectedEdge =>
      getEdgeKey(expectedEdge) === edgeKey);
    const sourceExists = graph.classes.includes(edge.source);
    const targetExists = graph.classes.includes(edge.target);
    const relationshipIsKnown = relationshipKinds.some(kind =>
      kind.id === edge.type);

    if (!sourceExists || !targetExists)
    {
      addIssue(
        'Add both endpoint classes before keeping this arrow.',
        [edge.source, edge.target],
        [],
        [edgeIndex],
      );
    }
    else if (edge.source === edge.target)
    {
      addIssue(
        'An arrow must connect two different classes.',
        [edge.source],
        [],
        [edgeIndex],
      );
    }
    else if (!relationshipIsKnown)
    {
      addIssue(
        `Choose a known relationship type for ${getClassLabel(edge.source)} → ${getClassLabel(edge.target)}.`,
        [edge.source, edge.target],
        [],
        [edgeIndex],
      );
    }
    else if (!isExpectedEdge)
    {
      addIssue(
        `Review ${getClassLabel(edge.source)} → ${getClassLabel(edge.target)}: the publisher keeps a list of Subscriber. Concrete subscribers implement that interface.`,
        [edge.source, edge.target],
        [],
        [edgeIndex],
      );
    }

    const previousEdgeIndex = seenEdges.get(edgeKey);
    if (previousEdgeIndex !== undefined)
    {
      addIssue(
        'This relationship is here twice. Remove one copy.',
        [edge.source, edge.target],
        [],
        [previousEdgeIndex, edgeIndex],
      );
    }
    seenEdges.set(edgeKey, edgeIndex);
  });

  return issues;
}

export function validateLesson(graph: LessonGraph): string[]
{
  return getLessonIssues(graph).map(issue => issue.message);
}

export type DiscoveryOptions = {
  danger: boolean;
  narionSubscribed: boolean;
};

export type DiscoveryResult = {
  danger: boolean;
  recipients: ('narion' | 'dre-kaar')[];
  responses: { narion: string; 'dre-kaar': string };
  summary: string;
  trace: string[];
};

export function discoverPath({
  danger,
  narionSubscribed,
}: DiscoveryOptions): DiscoveryResult
{
  let subscriptionDescription: string;
  if (narionSubscribed)
  {
    subscriptionDescription = 'Call fox.subscribe(narion) and fox.subscribe(dreKaar). Both are in the subscribers field.';
  }
  else
  {
    subscriptionDescription = 'Call fox.unsubscribe(narion). Only Dre’Kaar is in the subscribers field.';
  }

  if (!danger)
  {
    return {
      danger,
      recipients: [],
      responses: {
        narion: 'No message. The path is safe.',
        'dre-kaar': 'No message. The path is safe.',
      },
      summary: 'The path is safe. The fox sends no messages and keeps looking.',
      trace: [
        subscriptionDescription,
        'The fox checks the path and finds no danger.',
        'The fox does not call notify(). No Subscriber gets a message.',
      ],
    };
  }

  let recipients: ('narion' | 'dre-kaar')[];
  let narionResponse: string;
  let summary: string;
  const trace = [
    subscriptionDescription,
    'The fox sees danger. discoverDanger() saves “Danger ahead” and calls notify().',
    'notify() reads the subscribers field and calls update(discovery) on each active Subscriber.',
  ];

  if (narionSubscribed)
  {
    recipients = ['narion', 'dre-kaar'];
    narionResponse = 'Message received. Narion plans a safer path.';
    summary = 'Danger ahead! Narion and Dre’Kaar get the same message.';
    trace.push(
      'NarionSubscriber.update(discovery) calls planRoute(): Narion chooses a safer route.',
    );
  }
  else
  {
    recipients = ['dre-kaar'];
    narionResponse = 'No message. Narion’s bracelet is off.';
    summary = 'Danger ahead! Only Dre’Kaar gets the message. Narion’s bracelet is off.';
  }

  trace.push(
    'DreKaarSubscriber.update(discovery) calls prepareDefense(): Dre’Kaar gets ready to protect the group.',
  );

  return {
    danger,
    recipients,
    responses: {
      narion: narionResponse,
      'dre-kaar': 'Message received. Dre’Kaar gets ready to protect the group.',
    },
    summary,
    trace,
  };
}

export function simulateLesson(
  graph: LessonGraph,
  options: DiscoveryOptions = { danger: true, narionSubscribed: true },
): string[]
{
  if (validateLesson(graph).length > 0)
  {
    return ['The diagram is not ready. Read the messages and fix the diagram. Then run the discovery again.'];
  }

  return discoverPath(options).trace;
}

function isRecord(value: unknown): value is Record<string, unknown>
{
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Принимает незавершённые попытки, но отклоняет повреждённые или чужие данные. */
export function parseLesson(raw: string | null): LessonGraph
{
  if (!raw || raw.length > 50000)
  {
    return emptyLesson();
  }

  try
  {
    const parsedValue: unknown = JSON.parse(raw);
    if (!isRecord(parsedValue))
    {
      return emptyLesson();
    }

    const savedClasses = parsedValue.classes;
    if (
      !Array.isArray(savedClasses)
      || !savedClasses.every(classId =>
        typeof classId === 'string'
        && classCards.some(classCard => classCard.id === classId))
      || new Set(savedClasses).size !== savedClasses.length
    )
    {
      return emptyLesson();
    }

    const savedMembers = parsedValue.members;
    if (!isRecord(savedMembers))
    {
      return emptyLesson();
    }

    const membersAreValid = Object.entries(savedMembers).every(([memberId, owner]) =>
      memberCards.some(memberCard => memberCard.id === memberId)
      && typeof owner === 'string'
      && savedClasses.includes(owner));
    if (!membersAreValid)
    {
      return emptyLesson();
    }

    const savedEdges = parsedValue.edges;
    if (
      !Array.isArray(savedEdges)
      || savedEdges.length > 24
      ||       !savedEdges.every(edge =>
        isRecord(edge)
        && typeof edge.source === 'string'
        && typeof edge.target === 'string'
        && typeof edge.type === 'string')
    )
    {
      return emptyLesson();
    }

    const edgesHaveValidHandles = savedEdges.every(edge =>
      isRecord(edge)
      && [edge.sourceHandle, edge.targetHandle].every(handle =>
        handle === undefined || normalizeConnectionHandle(handle) !== undefined));
    if (!edgesHaveValidHandles)
    {
      return emptyLesson();
    }

    const savedGraph = parsedValue as unknown as LessonGraph;
    return {
      classes: [...savedGraph.classes],
      members: { ...savedGraph.members },
      edges: savedGraph.edges.map(edge =>
      {
        const normalizedSourceHandle = normalizeConnectionHandle(edge.sourceHandle);
        const normalizedTargetHandle = normalizeConnectionHandle(edge.targetHandle);
        const normalizedEdge: LessonGraph['edges'][number] = {
          source: edge.source,
          target: edge.target,
          type: edge.type,
        };

        if (edge.sourceHandle)
        {
          normalizedEdge.sourceHandle = normalizedSourceHandle;
        }

        if (edge.targetHandle)
        {
          normalizedEdge.targetHandle = normalizedTargetHandle;
        }

        return normalizedEdge;
      }),
    };
  }
  catch
  {
    return emptyLesson();
  }
}
