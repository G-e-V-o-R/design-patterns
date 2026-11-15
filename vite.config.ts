import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import { readConfiguredScenarios } from './scripts/scenarioConfigs';

const scenariosRoot = fileURLToPath(new URL('./src/scenarios', import.meta.url));

function validateScenarioConfigs(): Plugin
{
  return {
    name: 'validate-scenario-configs',
    buildStart()
    {
      readConfiguredScenarios(scenariosRoot);
    },
    configureServer(server)
    {
      function refresh(path: string)
      {
        if (!path.startsWith(scenariosRoot) || (!path.endsWith('/scenario.json') && !path.includes('/resource/')))
        {
          return;
        }
        try
        {
          readConfiguredScenarios(scenariosRoot);
          server.ws.send({ type: 'full-reload' });
        }
        catch (error)
        {
          const message = error instanceof Error ? error.message : String(error);
          server.ws.send({ type: 'error', err: { message, stack: '', plugin: 'validate-scenario-configs' } });
        }
      }
      server.watcher.on('add', refresh);
      server.watcher.on('change', refresh);
      server.watcher.on('unlink', refresh);
      server.httpServer?.once('close', () =>
      {
        server.watcher.off('add', refresh);
        server.watcher.off('change', refresh);
        server.watcher.off('unlink', refresh);
      });
    },
  };
}

export default defineConfig({ base: './', plugins: [validateScenarioConfigs()] });
