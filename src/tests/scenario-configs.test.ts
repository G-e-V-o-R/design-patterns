import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { readConfiguredScenarios } from '../../scripts/scenarioConfigs';
import { emptyConfiguredLesson, getConfiguredLessonIssues, solutionConfiguredLesson } from '../scenarios/shared/configuredLessonModel';

const configs = readConfiguredScenarios(resolve('src/scenarios'));
assert.deepEqual(configs.map(config => config.id).sort(), ['chain', 'command', 'decorator', 'mediator', 'observer', 'state', 'template'],
  'Discover every lesson from its config directory.');
for (const config of configs)
{
  assert.deepEqual(
    config.relationships.map(relationship => relationship.id).sort(),
    [...new Set(config.expectedEdges.map(edge => edge.type))].sort(),
    `${config.id}: the toolbar must offer only the relationship types declared by its classes.`,
  );
  const solution = solutionConfiguredLesson(config);
  assert.deepEqual(getConfiguredLessonIssues(config, solution), [], `${config.id}: its configured solution must be valid.`);
  assert.ok(getConfiguredLessonIssues(config, emptyConfiguredLesson()).length > 0, `${config.id}: empty diagrams must be incomplete.`);
  for (const member of config.members)
  {
    const incomplete = solutionConfiguredLesson(config);
    delete incomplete.members[member.id];
    assert.ok(getConfiguredLessonIssues(config, incomplete).some(issue => issue.memberIds.includes(member.id)),
      `${config.id}: missing ${member.id} must receive targeted feedback.`);
  }
  for (const [index, edge] of solution.edges.entries())
  {
    const reversed = solutionConfiguredLesson(config);
    reversed.edges[index] = { ...edge, source: edge.target, target: edge.source };
    assert.ok(getConfiguredLessonIssues(config, reversed).some(issue => issue.edgeIndices.includes(index)),
      `${config.id}: reversed ${edge.source} → ${edge.target} must receive targeted feedback.`);
  }
}
console.log(`Validated ${configs.length} configured scenarios, local artwork, solutions, and targeted invalid-diagram feedback.`);

const temporaryRoot = mkdtempSync(join(tmpdir(), 'scenario-sections-'));
try
{
  const directory = join(temporaryRoot, 'observer');
  cpSync(resolve('src/scenarios/observer/config'), join(directory, 'config'), { recursive: true });
  cpSync(resolve('src/scenarios/observer/resource'), join(directory, 'resource'), { recursive: true });
  assert.equal(readConfiguredScenarios(temporaryRoot)[0]?.id, 'observer');
  writeFileSync(join(directory, 'config', 'intro.json'), '{ broken JSON');
  assert.throws(() => readConfiguredScenarios(temporaryRoot), /intro.json/);
  rmSync(join(directory, 'config', 'intro.json'));
  assert.throws(() => readConfiguredScenarios(temporaryRoot), /intro.json/);
}
finally
{
  rmSync(temporaryRoot, { recursive: true, force: true });
}
