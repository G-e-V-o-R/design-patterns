import type { ChainResult, RequestKind } from './model';

type ChainDemoProps = {
  ready: boolean;
  result: ChainResult | null;
  onRun: (request: RequestKind) => void;
};

export function ChainDemo({ ready, result, onRun }: ChainDemoProps)
{
  if (!ready || !result)
  {
    return (
      <p className="chain-demo-empty">
        Finish the diagram to run the spider chain and see which handler responds.
      </p>
    );
  }

  return (
    <div className="chain-demo">
      <h3>Spider response</h3>
      <p>
        Request: <strong>{result.request}</strong>
      </p>
      <p>
        {result.handler === 'none'
          ? 'No handler accepted the signal.'
          : `Handled by ${result.handler}.`}
      </p>
      <ul>
        {result.trace.map((step, index) => (
          <li key={`${step}-${index}`}>{step}</li>
        ))}
      </ul>
      <div className="chain-demo-actions">
        <button type="button" onClick={() => onRun('blood')}>Blood</button>
        <button type="button" onClick={() => onRun('step')}>Step</button>
        <button type="button" onClick={() => onRun('iron')}>Iron</button>
        <button type="button" onClick={() => onRun('safe')}>No-op</button>
      </div>
    </div>
  );
}
