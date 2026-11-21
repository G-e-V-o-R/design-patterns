import { compileScenarioConfig } from '../../shared/scenarioConfig';
import classes from './classes.json';
import hints from './hints.json';
import intro from './intro.json';
import scenario from './scenario.json';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
  './hints.json': hints,
};

export const config = compileScenarioConfig(
  scenario,
  'proxy/config/scenario.json',
  path => path,
  path => sections[path],
);
