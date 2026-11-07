import { useEffect, useState } from 'react';
import type { DiscoveryResult } from './model';

export type DemoRun = { id: number; result: DiscoveryResult };

export function ObserverDemo({ ready, narionSubscribed, onToggleBracelet, onRun, run }: {
  ready: boolean;
  narionSubscribed: boolean;
  onToggleBracelet: () => void;
  onRun: (danger: boolean) => void;
  run: DemoRun | null;
}) {
  return <section className="observer-demo" aria-labelledby="demo-heading">
    <div className="demo-heading"><div><p className="lesson-kicker">TRY THE STORY</p><h2 id="demo-heading">Who gets the message?</h2></div><p>The fox sends a message only when it sees danger.</p></div>
    <p className="demo-subscribers"><code>subscribers: Subscriber[]</code><span>Active subscribers: {narionSubscribed ? 'Narion, Dre’Kaar' : 'Dre’Kaar'}</span></p>
    {!ready && <p className="demo-help">Finish the diagram first. Click Check diagram to find what to fix, or Show solution to try the example.</p>}
    <div className="demo-controls"><button disabled={!ready} onClick={() => onRun(true)}>Find danger</button><button disabled={!ready} onClick={() => onRun(false)}>Check a safe path</button></div>
    <DiscoveryScene key={run?.id ?? 'idle'} run={run} narionSubscribed={narionSubscribed} onToggleBracelet={onToggleBracelet}/>
  </section>;
}

function DiscoveryScene({ run, narionSubscribed, onToggleBracelet }: {
  run: DemoRun | null;
  narionSubscribed: boolean;
  onToggleBracelet: () => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase, setPhase] = useState<'idle' | 'checking' | 'sending' | 'finished'>(run ? 'checking' : 'idle');
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const shownPhase = reducedMotion && run ? 'finished' : phase;
  useEffect(() => {
    if (!run || phase === 'finished') return;
    if (reducedMotion) { setPhase('finished'); return; }
    const timer = window.setTimeout(() => setPhase(phase === 'checking' && run.result.danger ? 'sending' : 'finished'), phase === 'checking' ? 650 : 1400);
    return () => window.clearTimeout(timer);
  }, [run, phase, reducedMotion]);
  const result = run?.result;
  const finished = shownPhase === 'finished';
  const status = shownPhase === 'checking' ? 'The fox is checking the path.' : shownPhase === 'sending' ? 'Danger ahead! The fox is sending its message.' : finished && result ? result.summary : 'Choose a path to see what the fox does.';
  return <>
    <div className="demo-stage" data-phase={shownPhase}>
      <article className="demo-fox"><span aria-hidden="true">🦊</span><h3>Fox</h3><p>Publisher</p><p>{shownPhase === 'checking' ? 'Checking the path…' : result && finished ? result.danger ? 'Danger ahead!' : 'The path is safe.' : 'Looking for danger'}</p></article>
      {(['narion', 'dre-kaar'] as const).map(id => {
        const subscribed = id === 'dre-kaar' || narionSubscribed;
        const receives = result?.recipients.includes(id) ?? false;
        return <div className="demo-delivery" key={id}>
          <div className={'demo-message-path' + (!subscribed ? ' is-off' : '')} aria-hidden="true">
            <span className="demo-path-label">{shownPhase === 'sending' && receives ? 'Message' : finished && receives ? 'Sent' : finished ? 'No message' : !subscribed ? 'Off' : 'Ready'}</span>
            {shownPhase === 'sending' && receives && <span className="demo-message-dot"/>}<span className="demo-path-arrow">→</span>
          </div>
          <article className={'demo-person' + (finished && receives ? ' has-message' : '')}>
            <h3>{id === 'narion' ? 'Narion' : 'Dre’Kaar'}</h3>
            {id === 'narion' ? <button className="demo-bracelet" aria-pressed={narionSubscribed} aria-label="Narion’s bracelet" onClick={onToggleBracelet}><span aria-hidden="true">◯</span> {narionSubscribed ? 'Take off bracelet' : 'Put on bracelet'}</button> : <p className="demo-bracelet-state">Bracelet on · subscribed</p>}
            {id === 'narion' && <p className="demo-bracelet-state">{narionSubscribed ? 'Bracelet on · subscribed' : 'Bracelet off · unsubscribed'}</p>}
            <p className="demo-response">{finished && result ? result.responses[id] : subscribed ? 'Waiting for a message.' : 'No messages while the bracelet is off.'}</p>
          </article>
        </div>;
      })}
    </div>
    <p className="demo-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    {finished && result && <details className="demo-trace"><summary>See the method calls</summary><ol>{result.trace.map((step, index) => <li key={index}>{step}</li>)}</ol></details>}
  </>;
}
