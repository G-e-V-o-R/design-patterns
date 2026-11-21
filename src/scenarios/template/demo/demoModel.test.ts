import assert from 'node:assert/strict';
import { cookSoup } from './demoModel';

const faelina = cookSoup('faelina');
const latve = cookSoup('latve');
const dreKaar = cookSoup('dreKaar');

for (const steps of [faelina, latve, dreKaar])
{
  assert.deepEqual(steps.map(step => step.method), ['cookMeat()', 'addSeasoning()', 'addVegetables()']);
  assert.deepEqual(steps[0], faelina[0]);
  assert.deepEqual(steps[2], faelina[2]);
}

assert.match(faelina[1]!.detail, /garlic/);
assert.match(latve[1]!.detail, /fresh herbs/);
assert.match(dreKaar[1]!.detail, /smoked pepper/);
console.log('Template Method recipes follow the same sequence and provide different seasonings.');
