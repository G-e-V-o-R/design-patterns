import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import type { OrderId } from './demoModel';
import { changeOrders, createSimulation, executionHistory } from './demoModel';

assert.equal(createSimulation(emptyConfiguredLesson()), null, 'Invalid diagrams cannot run the demo.');

const graph = solutionConfiguredLesson(config);
const snapshot = structuredClone(graph);
const empty = createSimulation(graph);
assert.ok(empty);
const pending = changeOrders(empty, { type: 'register' });
assert.ok(pending.every(order => order.status === 'pending'));
assert.equal(changeOrders(pending, { type: 'register' }), pending);
assert.deepEqual(changeOrders(pending, { type: 'deliver', id: 'wake' }), pending);
assert.deepEqual(changeOrders(empty, { type: 'dispatch', id: 'wake' }), empty);

const trapsLaunching = changeOrders(pending, { type: 'dispatch', id: 'traps' });
assert.equal(trapsLaunching[1]?.status, 'launching');
assert.deepEqual(changeOrders(trapsLaunching, { type: 'deliver', id: 'traps' }), trapsLaunching);
const trapsInFlight = changeOrders(trapsLaunching, { type: 'launch', id: 'traps' });
assert.deepEqual(trapsInFlight.map(order => order.status), ['pending', 'in-flight', 'pending']);
assert.deepEqual(changeOrders(trapsInFlight, { type: 'execute', id: 'traps' }), trapsInFlight);
const trapsHandoff = changeOrders(trapsInFlight, { type: 'deliver', id: 'traps' });
assert.equal(trapsHandoff[1]?.status, 'handoff');
assert.equal(trapsHandoff[1]?.outcome, undefined);
assert.deepEqual(executionHistory(trapsHandoff), []);
const trapsDelivered = changeOrders(trapsHandoff, { type: 'execute', id: 'traps' });
assert.deepEqual(changeOrders(trapsDelivered, { type: 'execute', id: 'traps' }), trapsDelivered);
assert.deepEqual(trapsDelivered.map(order => order.outcome), [undefined, 'Faelina sets the traps.', undefined]);
assert.deepEqual(changeOrders(trapsDelivered, { type: 'deliver', id: 'traps' }), trapsDelivered);

const flankLaunching = changeOrders(trapsDelivered, { type: 'dispatch', id: 'flank' });
const flankInFlight = changeOrders(flankLaunching, { type: 'launch', id: 'flank' });

const flankHandoff = changeOrders(flankInFlight, { type: 'deliver', id: 'flank' });
const flankDelivered = changeOrders(flankHandoff, { type: 'execute', id: 'flank' });
assert.equal(flankDelivered[2]?.outcome, 'Narion reaches the right lookout. The right advance was a feint. The orcs are attacking on the left.');
const wakeLaunching = changeOrders(flankDelivered, { type: 'dispatch', id: 'wake' });
const wakeInFlight = changeOrders(wakeLaunching, { type: 'launch', id: 'wake' });
const undone = changeOrders(wakeInFlight, { type: 'undo', id: 'flank' });
assert.equal(undone[2]?.outcome, 'Narion guards the left flank.');
assert.equal(undone[2]?.status, 'undone');
assert.equal(undone[2]?.execution, flankDelivered[2]?.execution);
assert.equal(undone[0]?.status, 'in-flight');
assert.equal(undone[1], trapsDelivered[1]);
assert.equal(changeOrders(undone, { type: 'undo', id: 'flank' }), undone);

const wakeHandoff = changeOrders(wakeInFlight, { type: 'deliver', id: 'wake' });
const fullyDelivered = changeOrders(wakeHandoff, { type: 'execute', id: 'wake' });
assert.deepEqual(executionHistory(fullyDelivered).map(order => order.id), ['traps', 'flank', 'wake']);
assert.equal(changeOrders(pending, { type: 'undo', id: 'flank' }), pending);

const executionSequences: OrderId[][] = [
  ['flank', 'wake', 'traps'],
  ['traps', 'flank', 'wake'],
  ['wake', 'traps', 'flank'],
];

for (const sequence of executionSequences)
{
  const executed = sequence.reduce((orders, id) =>
  {
    const launching = changeOrders(orders, { type: 'dispatch', id });
    const flying = changeOrders(launching, { type: 'launch', id });
    const handoff = changeOrders(flying, { type: 'deliver', id });
    return changeOrders(handoff, { type: 'execute', id });
  }, pending);
  assert.equal(changeOrders(executed, { type: 'undo', id: 'wake' }), executed);
  assert.equal(changeOrders(executed, { type: 'undo', id: 'traps' }), executed);

  const undone = changeOrders(executed, { type: 'undo', id: 'flank' });
  assert.deepEqual(executionHistory(undone).map(order => order.id), sequence);
  assert.equal(undone[0], executed[0]);
  assert.equal(undone[1], executed[1]);
  assert.equal(undone[2]?.status, 'undone');
  assert.equal(undone[2]?.outcome, 'Narion guards the left flank.');
}
assert.deepEqual(createSimulation(graph), []);
assert.deepEqual(graph, snapshot);

console.log('Command demo: independent dispatch, delivery, and targeted undo history passed.');
