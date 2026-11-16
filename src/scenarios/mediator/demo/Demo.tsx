import { useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import { MediatorDemo } from './RoutingDemo';
import { simulateLesson, type CoordinationResult, type RequestKind } from './demoModel';
import './styles.css';

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [run, setRun] = useState<{ graph: typeof graph; result: CoordinationResult | null } | null>(null);
  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  function runRequest(request: RequestKind)
  {
    if (ready && active)
    {
      setRun({ graph, result: simulateLesson(graph, request) });
    }
  }

  return (
    <div className="mediator-scenario">
      <MediatorDemo
        ready={ready}
        active={active}
        result={run?.graph === graph ? run.result : null}
        onRun={runRequest}
      />
    </div>
  );
}
