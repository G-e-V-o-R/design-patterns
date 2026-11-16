import { useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import type { LessonGraph } from '../../shared/configuredLessonModel';
import { ChainDemo } from './ChainDemo';
import { simulateLesson, type ChainResult, type RequestKind } from './demoModel';
import './styles.css';

type DemoRun = {
  graph: LessonGraph;
  result: ChainResult;
};

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [run, setRun] = useState<DemoRun | null>(null);

  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  function sendSignal(request: RequestKind)
  {
    if (!ready || !active)
    {
      return;
    }
    const result = simulateLesson(graph, request);
    if (result)
    {
      setRun({ graph, result });
    }
  }

  const result = run?.graph === graph ? run.result : null;

  return (
    <div className="chain-scenario">
      <ChainDemo ready={ready && active} result={result} onRun={sendSignal} />
    </div>
  );
}
