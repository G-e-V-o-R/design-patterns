import type { ScenarioDefinition } from './types';
import { createConfiguredScenarios } from './configuredRegistry';
import type { ComponentType } from 'react';
import type { ConfiguredDemoProps } from './shared/ConfiguredScenario';

const legacyScenarios = [] as const satisfies readonly ScenarioDefinition[];

const configs = import.meta.glob('./*/config/scenario.json', { eager: true, import: 'default' });
const sections = import.meta.glob('./*/**/*.json', { eager: true, import: 'default' });
const artwork = import.meta.glob<string>('./*/resource/**/*.{png,jpg,jpeg,svg,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const demos = import.meta.glob<ComponentType<ConfiguredDemoProps>>('./*/demo/Demo.tsx', {
  eager: true,
  import: 'default',
});

export const scenarios = createConfiguredScenarios(configs, artwork, legacyScenarios, demos, sections);
