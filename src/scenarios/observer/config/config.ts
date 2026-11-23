import scenario from './scenario.json';
import intro from './intro.json';
import classes from './classes.json';
import relationships from './relationships.json';
import { compileScenarioConfig } from '../../shared/scenarioConfig';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
  './relationships.json': relationships,
};

export const config = compileScenarioConfig(
  scenario,
  'observer/config/scenario.json',
  path => path,
  path => sections[path],
);
