import { createElement, type ComponentType } from 'react';
import { ConfiguredScenario, type ConfiguredDemoProps } from './shared/ConfiguredScenario';
import { compileScenarioConfig } from './shared/scenarioConfig';
import type { ScenarioDefinition, ScenarioProps } from './types';

export function createConfiguredScenarios(
  configs: Record<string, unknown>,
  assets: Record<string, string>,
  existing: readonly ScenarioDefinition[],
  demos: Record<string, ComponentType<ConfiguredDemoProps>> = {},
): ScenarioDefinition[]
{
  const ids = new Set(existing.map(scenario => scenario.id));
  const compiled = Object.entries(configs).sort(([left], [right]) => left.localeCompare(right)).map(([path, input]) =>
  {
    const directory = path.split('/')[1];
    const config = compileScenarioConfig(input, path, relativePath =>
    {
      const assetPath = `./${directory}/${relativePath.replace(/^\.\//, '')}`;
      const asset = assets[assetPath];
      if (!asset)
      {
        throw new Error(`Missing artwork: ${assetPath}`);
      }
      return asset;
    });
    if (config.id !== directory)
    {
      throw new Error(`${path}: id must match directory "${directory}".`);
    }
    if (ids.has(config.id))
    {
      throw new Error(`${path}: duplicate scenario id "${config.id}".`);
    }
    ids.add(config.id);
    return config;
  });
  const reservedNumbers = new Set([
    ...existing.map(scenario => Number(scenario.number)),
    ...compiled.filter(config => config.number !== undefined).map(config => Number(config.number)),
  ]);
  let nextNumber = 1;
  const configured = compiled.map(config =>
  {
    while (reservedNumbers.has(nextNumber))
    {
      nextNumber += 1;
    }
    const number = config.number ?? String(nextNumber).padStart(2, '0');
    reservedNumbers.add(Number(number));
    const numberedConfig = { ...config, number, intro: { ...config.intro, number } };
    function Scenario(props: ScenarioProps)
    {
      return createElement(ConfiguredScenario, {
        ...props,
        config: numberedConfig,
        Demo: demos[`./${config.id}/Demo.tsx`],
      });
    }
    return { id: config.id, title: config.title, pattern: config.pattern, number, Component: Scenario };
  });
  return [...existing, ...configured].sort((left, right) =>
    left.number.localeCompare(right.number, undefined, { numeric: true }) || left.id.localeCompare(right.id));
}
