import { compileScenarioConfig } from '../../shared/scenarioConfig';
import scenario from './scenario.json';
import intro from './intro.json';
import classes from './classes.json';
import hints from './hints.json';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
  './hints.json': hints,
};

export const config = compileScenarioConfig(
  scenario,
  'state/config/scenario.json',
  path => path,
  path => sections[path],
);
