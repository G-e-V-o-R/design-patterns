import { useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import type { LessonGraph } from '../../shared/configuredLessonModel';
import { simulateDiscovery, type DiscoveryResult } from './demoModel';
import { ObserverDemo } from './NotificationDemo';
import './styles.css';

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [narionSubscribed, setNarionSubscribed] = useState(true);
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
    const result = simulateDiscovery(graph, { danger, narionSubscribed });
    setRun(result ? { graph, result } : null);
  }

  function toggleBracelet()
  {
    setNarionSubscribed(subscribed => !subscribed);
    setRun(null);
  }

  return (
    <div className="observer-scenario">
      <ObserverDemo
        ready={ready}
        active={active}
        narionSubscribed={narionSubscribed}
        onToggleBracelet={toggleBracelet}
        onRun={startDiscovery}
        run={run?.graph === graph ? run : null}
      />
    </div>
  );
}
