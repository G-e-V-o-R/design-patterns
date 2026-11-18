import { useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import type { LessonGraph } from '../../shared/configuredLessonModel';
import { simulateDiscovery, type DiscoveryResult, type ObserverId, type Subscriptions } from './demoModel';
import { ObserverDemo } from './NotificationDemo';
import './styles.css';

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({ narion: true, 'dre-kaar': true });
  const [run, setRun] = useState<{ graph: LessonGraph; result: DiscoveryResult } | null>(null);

  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  function startDiscovery(danger: boolean)
  {
    if (!ready || !active)
    {
      return;
    }
    const result = simulateDiscovery(graph, { danger, subscriptions });
    setRun(result ? { graph, result } : null);
  }

  function toggleBracelet(observer: ObserverId)
  {
    setSubscriptions(previous => ({ ...previous, [observer]: !previous[observer] }));
    setRun(null);
  }

  return (
    <div className="observer-scenario">
      <ObserverDemo
        ready={ready}
        active={active}
        subscriptions={subscriptions}
        onToggleBracelet={toggleBracelet}
        onRun={startDiscovery}
        run={run?.graph === graph ? run : null}
      />
    </div>
  );
}
