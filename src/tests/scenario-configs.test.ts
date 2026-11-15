import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { readConfiguredScenarios } from '../../scripts/scenarioConfigs';
import { emptyConfiguredLesson, getConfiguredLessonIssues, solutionConfiguredLesson } from '../scenarios/shared/configuredLessonModel';

const configs = readConfiguredScenarios(resolve('src/scenarios'));
assert.ok(configs.length > 0, 'Keep a working config-only example in the repository.');
for (const config of configs)
{
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
