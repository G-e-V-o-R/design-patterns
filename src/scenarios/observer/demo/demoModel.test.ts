import assert from 'node:assert/strict';
import { config } from '../config/config';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { simulateDiscovery } from './demoModel';

const graph = solutionConfiguredLesson(config);
const original = structuredClone(graph);

const danger = simulateDiscovery(graph, { danger: true, narionSubscribed: true });
assert.deepEqual(danger?.recipients, ['narion', 'dre-kaar']);
assert.ok(danger?.trace.some(step => step.includes('planRoute()')));
assert.ok(danger?.trace.some(step => step.includes('prepareDefense()')));

const unsubscribed = simulateDiscovery(graph, { danger: true, narionSubscribed: false });
assert.deepEqual(unsubscribed?.recipients, ['dre-kaar']);
assert.ok(unsubscribed?.responses.narion.includes('bracelet is off'));
assert.ok(unsubscribed?.trace.some(step => step.includes('detach(narion)')));
assert.ok(!unsubscribed?.trace.some(step => step.includes('planRoute()')));

for (const narionSubscribed of [true, false])
{
  const safe = simulateDiscovery(graph, { danger: false, narionSubscribed });
  assert.deepEqual(safe?.recipients, []);
  assert.ok(safe?.trace.some(step => step.includes('does not call notify()')));
  assert.ok(safe?.responses.narion.includes('path is safe'));
  assert.ok(safe?.responses['dre-kaar'].includes('path is safe'));
}

const options = { danger: true, narionSubscribed: true };
assert.equal(simulateDiscovery(emptyConfiguredLesson(), options), null);
const wrongOwner = structuredClone(graph);
wrongOwner.members.notify = 'narion';
assert.equal(simulateDiscovery(wrongOwner, options), null);
const reversed = structuredClone(graph);
const relationship = reversed.edges[0]!;
[relationship.source, relationship.target] = [relationship.target, relationship.source];
assert.equal(simulateDiscovery(reversed, options), null);
assert.deepEqual(graph, original, 'Discovery must not mutate the learner graph.');
assert.notEqual(danger, simulateDiscovery(graph, options));
console.log('Observer demo: danger, safe paths, subscriptions, traces, validation gate, and immutability passed.');
