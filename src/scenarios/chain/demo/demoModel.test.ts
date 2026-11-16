import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { chainConfig, simulateLesson, type RequestKind } from './demoModel';

const solution = solutionConfiguredLesson(chainConfig);
const before = structuredClone(solution);
const expectedVisits: Record<RequestKind, string[]> = {
  blood: ['thread', 'blood'],
  step: ['thread', 'blood', 'step'],
  iron: ['thread', 'blood', 'step', 'iron'],
  safe: ['thread', 'blood', 'step', 'iron'],
};

for (const request of Object.keys(expectedVisits) as RequestKind[])
{
  const result = simulateLesson(solution, request);
  assert.ok(result);
  assert.deepEqual(result.trace.map(step => step.handler), expectedVisits[request]);
  assert.equal(result.handler, request === 'safe' ? null : request);
  assert.equal(result.trace.at(-1)?.action, request === 'safe' ? 'unhandled' : 'handle');
  assert.equal(result.trace[0]?.action, 'forward');
  assert.ok(result.trace.slice(1, -1).every(step => step.action === 'pass'));
  const reordered = structuredClone(solution);
  reordered.classes.reverse();
  reordered.edges.reverse();
  assert.deepEqual(simulateLesson(reordered, request), result);
  assert.equal(simulateLesson(emptyConfiguredLesson(), request), null);
}

for (const member of chainConfig.members)
{
  const invalid = structuredClone(solution);
  delete invalid.members[member.id];
  assert.equal(simulateLesson(invalid, 'blood'), null);
}

for (let index = 0; index < solution.edges.length; index++)
{
  const invalid = structuredClone(solution);
  const edge = invalid.edges[index]!;
  [edge.source, edge.target] = [edge.target, edge.source];
  assert.equal(simulateLesson(invalid, 'iron'), null);
}

const cycle = structuredClone(solution);
cycle.edges.push({ source: 'iron', target: 'thread', type: 'next' });
assert.equal(simulateLesson(cycle, 'safe'), null);
assert.deepEqual(solution, before);
console.log('Chain demo: all signals, early stopping, unmatched traversal, invalid graph gating, and immutability passed.');
