const assert = {
  ok(value: unknown, message = 'Expected truthy value')
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

import {
  classCards,
  emptyLesson,
  getLessonIssues,
  memberCards,
  simulateLesson,
  solutionLesson,
  validateLesson,
} from './model';

assert.deepEqual(getLessonIssues(solutionLesson()), []);
assert.deepEqual(validateLesson(solutionLesson()), []);
assert.ok(getLessonIssues(emptyLesson()).length > 0, 'empty graph has issues');

const shuffled = solutionLesson();
shuffled.classes.reverse();
shuffled.edges.reverse();
assert.deepEqual(getLessonIssues(shuffled), [], 'layout/order is not semantic');

assert.equal(simulateLesson(emptyLesson(), 'blood'), null, 'invalid diagrams cannot run');
assert.equal(simulateLesson(emptyLesson(), 'safe'), null, 'invalid diagrams cannot run in no-op mode');

const blood = simulateLesson(solutionLesson(), 'blood');
assert.ok(blood, 'blood request should resolve');
assert.equal(blood!.handler, 'blood');
assert.ok(blood!.trace.some(step => step.includes('BloodSpider')));

const step = simulateLesson(solutionLesson(), 'step');
assert.ok(step, 'step request should resolve');
assert.equal(step!.handler, 'step');
assert.ok(step!.trace.some(stepText => stepText.includes('StepSpider')));

const iron = simulateLesson(solutionLesson(), 'iron');
assert.ok(iron, 'iron request should resolve');
assert.equal(iron!.handler, 'iron');
assert.ok(iron!.trace.some(stepText => stepText.includes('IronSpider')));

const safe = simulateLesson(solutionLesson(), 'safe');
assert.ok(safe, 'safe request should be a valid no-op');
assert.equal(safe!.handler, 'none');
assert.ok(safe!.trace.some(stepText => stepText.includes('stops without acting')));

for (const card of classCards)
{
  const graph = solutionLesson();
  graph.classes = graph.classes.filter(id => id !== card.id);
  assert.ok(
    getLessonIssues(graph).some(issue => issue.classIds.includes(card.id)),
    `missing ${card.id} is targeted`,
  );
}

for (const member of memberCards)
{
  const missing = solutionLesson();
  delete missing.members[member.id];
  assert.ok(
    getLessonIssues(missing).some(issue =>
      issue.memberIds.includes(member.id)
      && issue.classIds.includes(member.owner)),
    'missing member is targeted',
  );

  const wrongOwner = member.owner === 'thread' ? 'handler' : 'thread';
  const misplaced = solutionLesson();
  misplaced.members[member.id] = wrongOwner;
  assert.ok(
    getLessonIssues(misplaced).some(issue =>
      issue.memberIds.includes(member.id)
      && issue.classIds.includes(member.owner)
      && issue.classIds.includes(wrongOwner)),
    'misplaced member reports both classes',
  );
}

for (let index = 0; index < solutionLesson().edges.length; index++)
{
  const graph = solutionLesson();
  const [edge] = graph.edges.splice(index, 1);
  assert.ok(getLessonIssues(graph).length > 0, 'missing edge fails');
  assert.equal(simulateLesson(graph, 'blood'), null);

  graph.edges.push({
    ...edge!,
    source: edge!.target,
    target: edge!.source,
  });
  assert.ok(
    getLessonIssues(graph).some(issue =>
      issue.edgeIndices.includes(graph.edges.length - 1)),
    'reversed edge highlighted',
  );
}

const duplicate = solutionLesson();
duplicate.edges.push({ ...duplicate.edges[0]! });
assert.ok(
  getLessonIssues(duplicate).some(issue => issue.message.includes('duplicate')),
  'duplicate edges rejected',
);

const foreign = solutionLesson();
foreign.classes.push('wolf');
foreign.members.extra = 'wolf';
foreign.edges.push({ source: 'wolf', target: 'handler', type: 'next' });
assert.ok(getLessonIssues(foreign).length > 0, 'foreign scenario data rejected');

const probe = solutionLesson();
const before = JSON.stringify(probe);
getLessonIssues(probe);
simulateLesson(probe, 'blood');
assert.equal(JSON.stringify(probe), before, 'validation and simulation do not mutate the graph');

const first = solutionLesson();
first.classes.pop();
first.members.next = 'blood';
assert.deepEqual(
  getLessonIssues(solutionLesson()),
  [],
  'fresh solutions do not share mutable state',
);

const empty = emptyLesson();
empty.classes.push('handler');
empty.members.extra = 'handler';
assert.deepEqual(
  emptyLesson(),
  { classes: [], members: {}, edges: [] },
  'fresh attempts are independent',
);

console.log('Chain of Responsibility: validation, targeted feedback, routing, no-op handling, and state isolation passed.');
