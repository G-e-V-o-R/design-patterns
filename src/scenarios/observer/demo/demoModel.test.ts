import assert from 'node:assert/strict';
import { config } from '../config/config';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { simulateDiscovery, type ObserverId, type Subscriptions } from './demoModel';

const graph = solutionConfiguredLesson(config);
const original = structuredClone(graph);

const cases: { subscriptions: Subscriptions; recipients: ObserverId[] }[] = [
  { subscriptions: { narion: true, 'dre-kaar': true }, recipients: ['narion', 'dre-kaar'] },
  { subscriptions: { narion: true, 'dre-kaar': false }, recipients: ['narion'] },
  { subscriptions: { narion: false, 'dre-kaar': true }, recipients: ['dre-kaar'] },
  { subscriptions: { narion: false, 'dre-kaar': false }, recipients: [] },
];

for (const { subscriptions, recipients } of cases)
{
  const danger = simulateDiscovery(graph, { danger: true, subscriptions });
  assert.ok(danger);
  assert.deepEqual(danger.recipients, recipients);
  assert.equal(danger.trace.some(step => step.includes('planRoute()')), subscriptions.narion);
  assert.equal(danger.trace.some(step => step.includes('prepareDefense()')), subscriptions['dre-kaar']);
  assert.equal(danger.trace.some(step => step.includes('detach(narion)')), !subscriptions.narion);
  assert.equal(danger.trace.some(step => step.includes('detach(dreKaar)')), !subscriptions['dre-kaar']);
  assert.equal(danger.responses.narion.includes('bracelet is off'), !subscriptions.narion);
  assert.equal(danger.responses['dre-kaar'].includes('bracelet is off'), !subscriptions['dre-kaar']);
  assert.equal(danger.trace.some(step => step.includes('empty observers field')), recipients.length === 0);

  const safe = simulateDiscovery(graph, { danger: false, subscriptions });
  assert.deepEqual(safe?.recipients, []);
  assert.ok(safe?.trace.some(step => step.includes('does not call notify()')));
  assert.ok(safe?.responses.narion.includes('path is safe'));
  assert.ok(safe?.responses['dre-kaar'].includes('path is safe'));
}

const options = { danger: true, subscriptions: { narion: true, 'dre-kaar': true } };
assert.equal(simulateDiscovery(emptyConfiguredLesson(), options), null);
const wrongOwner = structuredClone(graph);
wrongOwner.members.notify = 'narion';
assert.equal(simulateDiscovery(wrongOwner, options), null);
const reversed = structuredClone(graph);
const relationship = reversed.edges[0]!;
[relationship.source, relationship.target] = [relationship.target, relationship.source];
assert.equal(simulateDiscovery(reversed, options), null);
assert.deepEqual(graph, original, 'Discovery must not mutate the learner graph.');
assert.notEqual(simulateDiscovery(graph, options), simulateDiscovery(graph, options));
console.log('Observer demo: danger, safe paths, subscriptions, traces, validation gate, and immutability passed.');
