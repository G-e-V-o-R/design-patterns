import { compileScenarioConfig } from '../../shared/scenarioConfig';
import scenario from './scenario.json';
import intro from './intro.json';
import classes from './classes.json';
import relationships from './relationships.json';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
  './relationships.json': relationships,
};

export const config = compileScenarioConfig(
  scenario,
  'decorator/config/scenario.json',
  path => path,
  path => sections[path],
);
