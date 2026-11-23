import assert from 'node:assert/strict';
import { emptyConfiguredLesson, solutionConfiguredLesson } from '../../shared/configuredLessonModel';
import { config } from '../config/config';
import { fightWithMask } from './demoModel';

const diagram = solutionConfiguredLesson(config);

assert.match(fightWithMask(diagram, 'bear') ?? '', /drives the troll back/);
assert.match(fightWithMask(diagram, 'snake') ?? '', /shadow coils around the troll/);
const owlFight = fightWithMask(diagram, 'owl') ?? '';
assert.match(owlFight, /see in the dark/);
assert.match(owlFight, /tracks the orc and strikes/);
assert.match(fightWithMask(diagram, 'bear') ?? '', /drives the troll back/);

assert.equal(fightWithMask(emptyConfiguredLesson(), 'bear'), null);

const incompleteDiagram = solutionConfiguredLesson(config);
incompleteDiagram.edges = incompleteDiagram.edges.filter(edge => edge.source !== 'snake-mask');
assert.equal(fightWithMask(incompleteDiagram, 'snake'), null);

console.log('Strategy demo switches combat behavior and rejects invalid diagrams.');
