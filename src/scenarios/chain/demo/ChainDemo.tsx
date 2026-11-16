import { chainConfig, classLabel, requests, type ChainResult, type RequestKind } from './demoModel';
import introImage from '../resource/intro.png?url';
import bloodImage from '../resource/blood-spider.png?url';
import stepImage from '../resource/step-spider.png?url';
import ironImage from '../resource/iron-spider.png?url';

const demoImages: Record<string, string> = {
  thread: introImage,
  blood: bloodImage,
  step: stepImage,
  iron: ironImage,
};

type ChainDemoProps = {
  ready: boolean;
  result: ChainResult | null;
  onRun: (request: RequestKind) => void;
};

function HandlerTrace({ result }: { result: ChainResult | null })
{
  return (
    <ol className="chain-route" aria-label="Request path">
      {(['thread', 'blood', 'step', 'iron'] as const).map(id =>
      {
        const step = result?.trace.find(item => item.handler === id);
        const artwork = chainConfig.classes.find(card => card.id === id)?.artwork;
        let status = 'Waiting for a signal';
        let state = 'waiting';
        if (result)
        {
          status = 'Not called — the request already stopped';
          state = 'skipped';
        }
        if (step)
        {
          status = step.message;
          state = step.action;
        }
        return (
          <li key={id} className={`chain-handler chain-handler-${state}`}>
            <span className="chain-handler-state">{state}</span>
            <h3>{classLabel(id)}</h3>
            {artwork && (
              <img className="chain-handler-artwork" src={demoImages[id]} alt={artwork.alt} draggable={false} />
            )}
            <p>{status}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function ChainDemo({ ready, result, onRun }: ChainDemoProps)
{
  return (
    <section className="chain-demo" aria-labelledby="chain-demo-heading">
      <p className="chain-kicker">TEST THE PATTERN</p>
      <h2 id="chain-demo-heading">Follow the signal</h2>
      <p>Send one request. Watch each handler pass it on, handle it, or reach the end without a match.</p>
      {!ready && <p className="chain-notice">Complete the class diagram to unlock the signals.</p>}
      <div className="chain-signals" aria-label="Signals to send">
        {requests.map(request => (
          <button
            key={request.id}
            disabled={!ready}
            aria-pressed={result?.request === request.id}
            onClick={() => onRun(request.id)}
          >
            {request.label}
          </button>
        ))}
      </div>
      <HandlerTrace result={result} />
      <div className="chain-outcome" role="status" aria-live="polite">
        {result ? result.summary : 'No signal sent yet.'}
      </div>
    </section>
  );
}
