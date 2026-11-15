import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { compileScenarioConfig } from '../src/scenarios/shared/scenarioConfig';

export function readConfiguredScenarios(root: string)
{
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'shared')
    .filter(entry => existsSync(join(root, entry.name, 'scenario.json')))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(entry =>
    {
      const directory = join(root, entry.name);
      const path = join(directory, 'scenario.json');
      let input: unknown;
      try
      {
        input = JSON.parse(readFileSync(path, 'utf8'));
      }
      catch (error)
      {
        throw new Error(`${path}: invalid JSON. ${String(error)}`);
      }
      const config = compileScenarioConfig(input, path, relativePath =>
      {
        const asset = join(directory, relativePath);
        if (!existsSync(asset) || !statSync(asset).isFile())
        {
          throw new Error(`Missing artwork: ${asset}`);
        }
        return asset;
      });
      if (config.id !== entry.name)
      {
        throw new Error(`${path}: id must match directory "${entry.name}".`);
      }
      return config;
    });
}
