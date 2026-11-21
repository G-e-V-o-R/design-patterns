import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import { createSimulation } from './demoModel';

const graph = solutionConfiguredLesson(config);
const originalGraph = structuredClone(graph);
const simulation = createSimulation(graph);
const secondSimulation = createSimulation(graph);
assert.ok(simulation);
assert.ok(secondSimulation);

const { jararis, snake } = simulation;
assert.equal(snake.stateId, 'calm');
assert.equal(snake.react(), 'quiet');

assert.deepEqual(jararis.handle('reassure'), { event: 'reassure', from: 'calm', to: 'calm' });
assert.equal(snake.react(), 'quiet');

assert.deepEqual(jararis.handle('approach'), { event: 'approach', from: 'calm', to: 'wary' });
assert.equal(snake.stateId, 'wary');
assert.equal(snake.react(), 'hiss');
assert.equal(snake.react(), 'hiss', 'Reacting must leave the current state in place.');
assert.equal(secondSimulation.snake.react(), 'quiet', 'Each snake keeps its own current state.');

assert.deepEqual(jararis.handle('approach'), { event: 'approach', from: 'wary', to: 'furious' });
assert.equal(snake.stateId, 'furious');
assert.equal(snake.react(), 'lunge');

assert.deepEqual(jararis.handle('approach'), { event: 'approach', from: 'furious', to: 'furious' });
assert.equal(snake.react(), 'lunge');

assert.deepEqual(jararis.handle('reassure'), { event: 'reassure', from: 'furious', to: 'wary' });
assert.equal(snake.react(), 'hiss');

assert.deepEqual(jararis.handle('reassure'), { event: 'reassure', from: 'wary', to: 'calm' });
assert.equal(snake.stateId, 'calm');
assert.equal(snake.react(), 'quiet');
assert.deepEqual(graph, originalGraph, 'The demo must leave the diagram intact.');

assert.equal(createSimulation(emptyConfiguredLesson()), null);
const reversed = { ...graph, edges: [...graph.edges] };
const [edge] = reversed.edges;
assert.ok(edge);
reversed.edges[0] = { ...edge, source: edge.target, target: edge.source };
assert.equal(createSimulation(reversed), null);

console.log('State demo: reactions, all six event transitions, isolation, and diagram validation passed.');
