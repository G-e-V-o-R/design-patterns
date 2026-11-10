import ObserverScenario from './observer/Scenario';
import MediatorScenario from './mediator/Scenario';
import ChainScenario from './chain/Scenario';
import type { ScenarioDefinition } from './types';
export const scenarios = [
  { id: 'observer', number: '01', title: 'The fox’s discovery', pattern: 'Observer', Component: ObserverScenario },
  { id: 'mediator', number: '02', title: 'Thoughts through the raven', pattern: 'Mediator', Component: MediatorScenario },
  { id: 'chain', number: '03', title: 'Silk in the wind', pattern: 'Chain of Responsibility', Component: ChainScenario },
] as const satisfies readonly ScenarioDefinition[];
