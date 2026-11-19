import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import { speakWithEffects, voiceEffects } from './demoModel';

const solution = solutionConfiguredLesson(config);
const originalGraph = structuredClone(solution);
const words = 'It starts with the voice.';
const plain = speakWithEffects(solution, []);
assert.deepEqual(plain, { words, effects: [] });

for (const effect of voiceEffects)
{
  assert.deepEqual(speakWithEffects(solution, [effect]), { words, effects: [effect] });
}

assert.deepEqual(speakWithEffects(solution, ['sleep', 'storm']), { words, effects: ['sleep', 'storm'] });
assert.deepEqual(speakWithEffects(solution, ['storm', 'hypnosis', 'sleep']), {
  words,
  effects: ['storm', 'hypnosis', 'sleep'],
});

assert.deepEqual(speakWithEffects(solution, []), plain, 'Speaking through wrappers leaves the plain voice unchanged.');
assert.deepEqual(solution, originalGraph, 'Speaking does not edit the diagram.');
assert.equal(speakWithEffects(emptyConfiguredLesson(), ['sleep']), null);

const missingWrap = { ...solution, edges: solution.edges.filter(edge => edge.type !== 'wraps') };
assert.equal(speakWithEffects(missingWrap, ['storm']), null, 'The diagram needs the wraps relationship.');

delete solution.members['wrapped-voice'];
assert.equal(speakWithEffects(solution, ['hypnosis']), null, 'The decorator needs a reference to the wrapped voice.');
