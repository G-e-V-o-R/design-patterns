import type { ComponentType } from 'react';
/** The shell knows presentation metadata, never a scenario's internal state. */
export type ScenarioDefinition = {
  id: string;
  number: string;
  title: string;
  pattern: string;
  Component: ComponentType;
};
