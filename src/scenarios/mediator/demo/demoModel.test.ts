import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { demoConfig, simulateLesson } from './demoModel';

const solution = solutionConfiguredLesson(demoConfig);
const original = structuredClone(solution);
const cover = simulateLesson(solution, 'cover')!;
assert.equal(cover.sender, 'dre-kaar');
assert.equal(cover.recipient, 'narion');
assert.equal(cover.trace.length, 4);
assert.ok(cover.trace.some(step => step.includes('provideCover()')));
assert.ok(cover.summary.includes('Only Narion'));

const shelter = simulateLesson(solution, 'shelter')!;
assert.equal(shelter.sender, 'faelina');
assert.equal(shelter.recipient, 'saerenn');
assert.ok(shelter.trace.some(step => step.includes('provideShelter()')));
assert.ok(shelter.summary.includes('Only Saerenn'));
assert.deepEqual(solution, original, 'Running requests does not mutate the learner graph.');

for (const request of ['cover', 'shelter'] as const)
{
  assert.equal(simulateLesson(emptyConfiguredLesson(), request), null);
  for (let index = 0; index < solution.edges.length; index += 1)
  {
    const missingLink = structuredClone(solution);
    missingLink.edges.splice(index, 1);
    assert.equal(simulateLesson(missingLink, request), null, 'Every configured relationship gates the demo.');
  }
  const peerDependency = structuredClone(solution);
  peerDependency.edges.push({ source: 'dre-kaar', target: 'narion', type: 'uses' });
  assert.equal(simulateLesson(peerDependency, request), null, 'Direct peer dependencies invalidate the Mediator model.');
  const misplacedMember = structuredClone(solution);
  misplacedMember.members.participants = 'narion';
  assert.equal(simulateLesson(misplacedMember, request), null);
}

const reordered = structuredClone(solution);
reordered.classes.reverse();
reordered.edges.reverse();
assert.deepEqual(simulateLesson(reordered, 'cover'), cover);
cover.trace.push('changed');
assert.equal(simulateLesson(solution, 'cover')?.trace.length, 4, 'Results do not share mutable traces.');
console.log('Mediator demo: both routes, traces, config validation gating, and isolation passed.');
