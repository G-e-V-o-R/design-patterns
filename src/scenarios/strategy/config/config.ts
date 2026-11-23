import { compileScenarioConfig } from '../../shared/scenarioConfig';
import classes from './classes.json';
import intro from './intro.json';
import scenario from './scenario.json';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
};

export const config = compileScenarioConfig(
  scenario,
  'strategy/config/scenario.json',
  path => path,
  path => sections[path],
);
