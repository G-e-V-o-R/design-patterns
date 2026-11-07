import ObserverScenario from './observer/ObserverScenario';
import MediatorScenario from './mediator/MediatorScenario';
import type { ScenarioDefinition } from './types';
export const scenarios = [
  { id: 'observer', number: '01', title: 'The fox’s discovery', pattern: 'Observer', Component: ObserverScenario },
  { id: 'mediator', number: '02', title: 'Thoughts through the raven', pattern: 'Mediator', Component: MediatorScenario },
] as const satisfies readonly ScenarioDefinition[];
