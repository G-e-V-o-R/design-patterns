import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import { simulateRequest, wizardLetter } from './demoModel';

const graph = solutionConfiguredLesson(config);
const original = structuredClone(graph);

const approved = simulateRequest(graph, wizardLetter);
assert.ok(approved);
assert.deepEqual(approved.map(stage => stage.phase), [
  'request', 'check-letter', 'verify-letter', 'verified', 'forward', 'answer', 'relay', 'helped',
]);
assert.match(approved[2]?.message ?? '', /compares the signature and wax seal/);
assert.equal(approved.filter(stage => stage.call === 'elder.requestHelp(request)').length, 1);

const refusalCases = [
  { letter: null, checks: ['check-letter'], reason: /remembers the letter in his coat/ },
  { letter: { ...wizardLetter, seal: 'crescent' }, checks: ['check-letter', 'verify-letter'], reason: /can’t verify the letter/ },
  { letter: { ...wizardLetter, signature: 'Narion' }, checks: ['check-letter', 'verify-letter'], reason: /can’t verify the letter/ },
];

for (const { letter, checks, reason } of refusalCases)
{
  const refused = simulateRequest(graph, letter);
  assert.ok(refused);
  assert.deepEqual(refused.map(stage => stage.phase), ['request', ...checks, 'refuse', 'denied']);
  assert.match(refused.at(-1)?.message ?? '', reason);
  assert.match(refused.at(-1)?.message ?? '', /Elder never hears the request/);
  assert.ok(refused.every(stage => stage.call !== 'elder.requestHelp(request)'));
  assert.deepEqual(refused.slice(0, 2).map(stage => stage.call), approved.slice(0, 2).map(stage => stage.call));
}

const reversed = structuredClone(graph);
const guardDelegation = reversed.edges.find(edge => edge.source === 'guard' && edge.target === 'elder');
assert.ok(guardDelegation);
[guardDelegation.source, guardDelegation.target] = [guardDelegation.target, guardDelegation.source];

for (const letter of [null, wizardLetter])
{
  assert.equal(simulateRequest(emptyConfiguredLesson(), letter), null);
  assert.equal(simulateRequest(reversed, letter), null);
}

assert.deepEqual(graph, original, 'The simulation must preserve the learner graph.');
console.log('Proxy demo: forgotten letter, signature and seal verification, delegation, and diagram validation passed.');
