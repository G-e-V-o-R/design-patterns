import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import { canCancel, changeOrders, createSimulation, executionHistory } from './demoModel';

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

const trapsInFlight = changeOrders(pending, { type: 'dispatch', id: 'traps' });
assert.deepEqual(trapsInFlight.map(order => order.status), ['pending', 'in-flight', 'pending']);
const trapsDelivered = changeOrders(trapsInFlight, { type: 'deliver', id: 'traps' });
assert.deepEqual(trapsDelivered.map(order => order.outcome), [undefined, 'Faelina sets the traps.', undefined]);
assert.deepEqual(changeOrders(trapsDelivered, { type: 'deliver', id: 'traps' }), trapsDelivered);

const flankInFlight = changeOrders(trapsDelivered, { type: 'dispatch', id: 'flank' });
assert.ok(canCancel('in-flight'));
const recalled = changeOrders(flankInFlight, { type: 'cancel', id: 'flank' });
assert.deepEqual(recalled.map(order => order.status), ['pending', 'executed', 'canceled']);
assert.deepEqual(executionHistory(recalled).map(order => order.id), ['traps']);
assert.deepEqual(changeOrders(recalled, { type: 'deliver', id: 'flank' }), recalled);

const flankDelivered = changeOrders(flankInFlight, { type: 'deliver', id: 'flank' });
assert.equal(flankDelivered[2]?.outcome, 'Narion guards the flank.');
const wakeInFlight = changeOrders(flankDelivered, { type: 'dispatch', id: 'wake' });
const undone = changeOrders(wakeInFlight, { type: 'undo-last' });
assert.equal(undone[2]?.outcome, 'Narion is at the hill post.');
assert.equal(undone[0]?.status, 'in-flight');
assert.equal(undone[1], trapsDelivered[1]);
assert.equal(changeOrders(undone, { type: 'undo-last' }), undone);

const fullyDelivered = changeOrders(wakeInFlight, { type: 'deliver', id: 'wake' });
assert.deepEqual(executionHistory(fullyDelivered).map(order => order.id), ['traps', 'flank', 'wake']);
assert.equal(changeOrders(fullyDelivered, { type: 'undo-last' }), fullyDelivered);
assert.equal(canCancel('executed'), false);
assert.deepEqual(createSimulation(graph), []);
assert.deepEqual(graph, snapshot);

console.log('Command demo: independent dispatch, delivery, recall, and ordered undo history passed.');
