import {
  connectionHandles,
  discoverPath,
  emptyLesson,
  getLessonIssues,
  parseLesson,
  simulateLesson,
  solutionLesson,
  validateLesson,
} from './model';

const assert = {
  ok(value: unknown, message = 'Expected a truthy value')
  {
    if (!value)
    {
      throw new Error(message);
    }
  },

  equal(actual: unknown, expected: unknown, message = 'Values differ')
  {
    if (actual !== expected)
    {
      throw new Error(message);
    }
  },

  deepEqual(actual: unknown, expected: unknown, message = 'Structures differ')
  {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
    {
      throw new Error(message);
    }
  },
};

const completeLessonGraph = solutionLesson();
assert.deepEqual(validateLesson(completeLessonGraph), []);
assert.ok(validateLesson(emptyLesson()).length > 0);
assert.equal(completeLessonGraph.members.subscribers, 'publisher');

const graphWithoutSubscribersField = {
  ...completeLessonGraph,
  members: { ...completeLessonGraph.members },
};
delete graphWithoutSubscribersField.members.subscribers;
assert.deepEqual(
  parseLesson(JSON.stringify(graphWithoutSubscribersField)),
  graphWithoutSubscribersField,
  'keep older diagrams without the new field',
);
assert.ok(
  validateLesson(graphWithoutSubscribersField)
    .some(message => message.includes('Place subscribers: Subscriber[]')),
);

const graphWithMisplacedSubscribersField = {
  ...completeLessonGraph,
  members: { ...completeLessonGraph.members, subscribers: 'narion' },
};
assert.ok(
  validateLesson(graphWithMisplacedSubscribersField)
    .some(message => message.includes('subscribers: Subscriber[] belongs in FoxPublisher')),
);
assert.equal(simulateLesson(graphWithMisplacedSubscribersField).length, 1);

const graphWithMisplacedNotifyMethod = {
  ...completeLessonGraph,
  members: { ...completeLessonGraph.members, notify: 'subscriber' },
};
assert.ok(
  validateLesson(graphWithMisplacedNotifyMethod)
    .some(message => message.includes('notify() belongs in FoxPublisher')),
);
assert.equal(simulateLesson(graphWithMisplacedNotifyMethod).length, 1);
assert.ok(
  !simulateLesson(graphWithMisplacedNotifyMethod)
    .some(message => message.includes('chooses a safer route')),
);

for (const expectedEdge of completeLessonGraph.edges)
{
  const graphWithoutEdge = {
    ...completeLessonGraph,
    edges: completeLessonGraph.edges.filter(edge => edge !== expectedEdge),
  };
  assert.ok(validateLesson(graphWithoutEdge).length);

  const reversedEdge = {
    ...expectedEdge,
    source: expectedEdge.target,
    target: expectedEdge.source,
  };
  const graphWithReversedEdge = {
    ...graphWithoutEdge,
    edges: [...graphWithoutEdge.edges, reversedEdge],
  };
  assert.ok(validateLesson(graphWithReversedEdge).length);
}

assert.ok(validateLesson({
  ...completeLessonGraph,
  edges: [
    ...completeLessonGraph.edges,
    { source: 'publisher', target: 'narion', type: 'stores' },
  ],
}).length);
assert.ok(validateLesson({
  ...completeLessonGraph,
  edges: [...completeLessonGraph.edges, completeLessonGraph.edges[0]!],
}).length);
assert.ok(validateLesson({
  ...completeLessonGraph,
  classes: completeLessonGraph.classes.filter(classId => classId !== 'subscriber'),
}).length);

const lessonTrace = simulateLesson(completeLessonGraph);
assert.ok(lessonTrace.some(step => step.includes('fox.subscribe(narion)')));
assert.ok(lessonTrace.some(step => step.includes('NarionSubscriber.update')));
assert.ok(lessonTrace.some(step => step.includes('DreKaarSubscriber.update')));
assert.ok(!lessonTrace.some(step => step.includes('fox.unsubscribe(narion)')));
assert.ok(
  simulateLesson(completeLessonGraph, {
    danger: true,
    narionSubscribed: false,
  }).some(step => step.includes('fox.unsubscribe(narion)')),
);
assert.deepEqual(parseLesson(JSON.stringify(completeLessonGraph)), completeLessonGraph);
assert.deepEqual(
  parseLesson(JSON.stringify(graphWithMisplacedNotifyMethod)),
  graphWithMisplacedNotifyMethod,
  'retain structurally safe but incorrect attempts',
);

const partialLessonGraph = {
  classes: ['publisher'],
  members: { subscribe: 'publisher' },
  edges: [],
};
assert.deepEqual(parseLesson(JSON.stringify(partialLessonGraph)), partialLessonGraph);

const malformedSavedDiagrams = [
  null,
  '{',
  'null',
  '[]',
  '{}',
  JSON.stringify({ classes: ['raven'], members: {}, edges: [] }),
  JSON.stringify({ ...completeLessonGraph, members: { notify: 'unknown' } }),
  JSON.stringify({ ...completeLessonGraph, edges: [null] }),
  JSON.stringify({
    ...completeLessonGraph,
    edges: [{ source: 'publisher', target: 'subscriber', type: 'unknown' }],
  }),
  JSON.stringify({ ...completeLessonGraph, classes: ['publisher', 'publisher'] }),
  ' '.repeat(50001),
];

for (const rawDiagram of malformedSavedDiagrams)
{
  assert.deepEqual(parseLesson(rawDiagram), emptyLesson());
}

for (const sourceHandle of connectionHandles)
{
  for (const targetHandle of connectionHandles)
  {
    const graphWithSelectedPorts = {
      ...completeLessonGraph,
      edges: completeLessonGraph.edges.map(edge => ({
        ...edge,
        sourceHandle,
        targetHandle,
      })),
    };
    assert.deepEqual(
      parseLesson(JSON.stringify(graphWithSelectedPorts)),
      graphWithSelectedPorts,
      'preserve both selected ports',
    );
    assert.deepEqual(
      validateLesson(graphWithSelectedPorts),
      [],
      'port placement does not change relationship meaning',
    );
  }
}

for (const handleSide of connectionHandles)
{
  for (const endpointSuffix of ['start', 'end'])
  {
    const graphWithOldPorts = {
      ...completeLessonGraph,
      edges: completeLessonGraph.edges.map(edge => ({
        ...edge,
        sourceHandle: `${handleSide}-${endpointSuffix}`,
        targetHandle: `${handleSide}-${endpointSuffix}`,
      })),
    };
    const graphWithCenteredPorts = {
      ...completeLessonGraph,
      edges: completeLessonGraph.edges.map(edge => ({
        ...edge,
        sourceHandle: handleSide,
        targetHandle: handleSide,
      })),
    };
    assert.deepEqual(
      parseLesson(JSON.stringify(graphWithOldPorts)),
      graphWithCenteredPorts,
      'move old points to the center of the same side',
    );
  }
}

for (const handleField of ['sourceHandle', 'targetHandle'])
{
  for (const malformedHandle of ['unknown', 'top-middle', 'left-end-extra', '', null, 42, {}])
  {
    const graphWithMalformedPort = {
      ...completeLessonGraph,
      edges: [{
        ...completeLessonGraph.edges[0],
        [handleField]: malformedHandle,
      }],
    };
    assert.deepEqual(
      parseLesson(JSON.stringify(graphWithMalformedPort)),
      emptyLesson(),
      'reject malformed ports',
    );
  }
}

completeLessonGraph.members.notify = 'narion';
assert.equal(
  solutionLesson().members.notify,
  'publisher',
  'solution must not share mutable state',
);
console.log('Observer lesson: validation, simulation, and saved-attempt checks passed.');

// Одно событие получает только активная подписка; безопасный путь ничего не отправляет.
for (const narionSubscribed of [true, false])
{
  const discoveryOptions = { danger: true, narionSubscribed };
  const optionsBeforeDiscovery = JSON.stringify(discoveryOptions);
  const dangerousPath = discoverPath(discoveryOptions);
  let expectedRecipients: string[];
  if (narionSubscribed)
  {
    expectedRecipients = ['narion', 'dre-kaar'];
  }
  else
  {
    expectedRecipients = ['dre-kaar'];
  }

  assert.deepEqual(dangerousPath.recipients, expectedRecipients);
  assert.equal(
    JSON.stringify(discoveryOptions),
    optionsBeforeDiscovery,
    'discovery does not change subscription choices',
  );
  assert.equal(
    dangerousPath.trace.some(step => step.includes('NarionSubscriber.update')),
    narionSubscribed,
  );

  const safePath = discoverPath({ danger: false, narionSubscribed });
  assert.deepEqual(safePath.recipients, []);
  assert.ok(safePath.summary.includes('no messages'));
  assert.ok(!safePath.trace.some(step =>
    step.includes('calls planRoute') || step.includes('calls prepareDefense')));
}

const validLessonGraph = solutionLesson();
assert.deepEqual(getLessonIssues(validLessonGraph), []);

const missingFieldIssues = getLessonIssues(graphWithoutSubscribersField);
assert.ok(missingFieldIssues.some(issue =>
  issue.memberIds.includes('subscribers')
  && issue.classIds.includes('publisher')));

const misplacedFieldIssues = getLessonIssues(graphWithMisplacedSubscribersField);
assert.ok(misplacedFieldIssues.some(issue =>
  issue.memberIds.includes('subscribers')
  && issue.classIds.includes('publisher')
  && issue.classIds.includes('narion')));

const graphMissingPublisher = {
  ...validLessonGraph,
  classes: validLessonGraph.classes.filter(classId => classId !== 'publisher'),
};
assert.ok(getLessonIssues(graphMissingPublisher).some(issue =>
  issue.message.startsWith('Add the FoxPublisher')
  && issue.classIds.includes('publisher')));

const graphMissingRelationship = {
  ...validLessonGraph,
  edges: validLessonGraph.edges.slice(1),
};
assert.ok(getLessonIssues(graphMissingRelationship).some(issue =>
  issue.classIds.includes('publisher')
  && issue.classIds.includes('subscriber')
  && !issue.edgeIndices.length));

const graphWithReversedRelationship = {
  ...validLessonGraph,
  edges: [
    { source: 'subscriber', target: 'publisher', type: 'stores' },
    ...validLessonGraph.edges.slice(1),
  ],
};
assert.ok(getLessonIssues(graphWithReversedRelationship).some(issue =>
  issue.edgeIndices.includes(0)
  && issue.classIds.includes('publisher')));

const graphWithExtraRelationship = {
  ...validLessonGraph,
  edges: [
    ...validLessonGraph.edges,
    { source: 'publisher', target: 'narion', type: 'stores' },
  ],
};
assert.ok(getLessonIssues(graphWithExtraRelationship).some(issue =>
  issue.edgeIndices.includes(3)));

const graphWithDuplicateRelationship = {
  ...validLessonGraph,
  edges: [...validLessonGraph.edges, validLessonGraph.edges[0]!],
};
assert.ok(getLessonIssues(graphWithDuplicateRelationship).some(issue =>
  issue.edgeIndices.includes(0) && issue.edgeIndices.includes(3)));
console.log('Observer discovery and targeted feedback checks passed.');
