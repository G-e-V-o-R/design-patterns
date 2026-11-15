import { useEffect, useRef, useState } from 'react';
import type { ConfiguredDemoProps } from '../shared/ConfiguredScenario';
import type { LessonGraph } from '../shared/configuredLessonModel';
import { simulateDiscovery } from './demoModel';
import { ObserverDemo, type DemoRun } from './NotificationDemo';
import './styles.css';

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [narionSubscribed, setNarionSubscribed] = useState(true);
  const [run, setRun] = useState<(DemoRun & { graph: LessonGraph }) | null>(null);
  const nextRunId = useRef(0);

  useEffect(() =>
  {
    setRun(null);
  }, [graph]);

  function startDiscovery(danger: boolean)
  {
    if (!ready || !active)
    {
      return;
    }
    const result = simulateDiscovery(graph, { danger, narionSubscribed });
    setRun(result ? { id: ++nextRunId.current, graph, result } : null);
  }

  function toggleBracelet()
  {
    setNarionSubscribed(subscribed => !subscribed);
    setRun(null);
  }

  return (
    <div className="observer-scenario" data-active={active}>
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
