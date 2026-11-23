import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import { fightWithMask } from './demoModel';

const diagram = solutionConfiguredLesson(config);

assert.match(fightWithMask(diagram, 'bear') ?? '', /drives the troll back/);
assert.match(fightWithMask(diagram, 'serpent') ?? '', /shadow coils around the troll/);
assert.match(fightWithMask(diagram, 'owl') ?? '', /tracks the troll in the dark/);
assert.match(fightWithMask(diagram, 'bear') ?? '', /drives the troll back/);

assert.equal(fightWithMask(emptyConfiguredLesson(), 'bear'), null);

const incompleteDiagram = solutionConfiguredLesson(config);
incompleteDiagram.edges = incompleteDiagram.edges.filter(edge => edge.source !== 'serpent-mask');
assert.equal(fightWithMask(incompleteDiagram, 'serpent'), null);

console.log('Strategy demo switches combat behavior and rejects invalid diagrams.');
