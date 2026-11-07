import { classLabel, type CoordinationResult, type RequestKind } from './model';

export function MediatorDemo({ ready, result, onRun }: {
  ready: boolean;
  result: CoordinationResult | null;
  onRun: (request: RequestKind) => void;
}) {
  return <section className="med-demo" aria-labelledby="mediator-demo-heading">
    <p className="med-kicker">TRY THE STORY</p>
    <h2 id="mediator-demo-heading">The right request. The right companion.</h2>
    <p>The raven owns the routing rule. The sender knows only its mediator.</p>
    {!ready && <p className="med-notice">Complete the diagram, or show the solution, to try both requests.</p>}
    <div className="med-actions">
      <button disabled={!ready} onClick={() => onRun('cover')}>Dre’Kaar requests cover</button>
      <button disabled={!ready} onClick={() => onRun('shelter')}>Faelina requests shelter</button>
    </div>
    <div className="med-route" aria-label="Request route">
      <article><small>SENDER</small><h3>{result ? classLabel(result.sender) : 'A companion'}</h3><p>{result ? `“I need ${result.request}.”` : 'Asks for help'}</p></article>
      <span aria-hidden="true">→</span>
      <article className="med-raven"><small>MEDIATOR</small><h3>Raven</h3><p>Chooses who can help</p></article>
      <span aria-hidden="true">→</span>
      <article className={result ? 'med-received' : ''}><small>SELECTED RECIPIENT</small><h3>{result ? classLabel(result.recipient) : 'One companion'}</h3><p>{result ? result.request === 'cover' ? 'Provides covering fire' : 'Provides shelter' : 'Performs its own action'}</p></article>
    </div>
    <p className="med-demo-status" role="status" aria-live="polite">{result?.summary ?? 'Choose a request to follow its route through the raven.'}</p>
    {result && <details className="med-trace" open><summary>See the method calls</summary><ol>{result.trace.map(step => <li key={step}>{step}</li>)}</ol></details>}
    <p className="med-comparison">Observer shares an event with active subscribers. Here, Mediator coordinates a particular request and chooses the recipient.</p>
  </section>;
}
