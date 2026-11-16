import scenario from './scenario.json';
import intro from './intro.json';
import classes from './classes.json';
import hints from './hints.json';
import relationships from './relationships.json';
import { compileScenarioConfig } from '../../shared/scenarioConfig';

const sections: Record<string, unknown> = {
  './intro.json': intro,
  './classes.json': classes,
  './hints.json': hints,
  './relationships.json': relationships,
};

export const config = compileScenarioConfig(
  scenario,
  'mediator/config/scenario.json',
  path => path,
  path => sections[path],
);
