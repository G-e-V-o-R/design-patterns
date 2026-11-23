import { compileScenarioConfig } from '../../shared/scenarioConfig';
import scenario from './scenario.json';
import intro from './intro.json';
import classes from './classes.json';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
};

export const config = compileScenarioConfig(
  scenario,
  'state/config/scenario.json',
  path => path,
  path => sections[path],
);
