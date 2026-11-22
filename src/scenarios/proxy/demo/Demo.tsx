import { useEffect, useRef, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import narion from '../../shared/resource/portraits/narion.png';
import guard from '../resource/tish-karr-guard.png';
import elder from '../resource/tish-karr-inside-the-den.png';
import { antidoteRequest, getMessageDuration, oldLetter, simulateRequest, wizardLetter, type Phase } from './demoModel';
import './styles.css';

const minimumVerificationDuration = 2400;
const minimumHandoffDuration = 1550;

const actors = [
  { id: 'narion', name: 'Narion', role: 'Client', image: narion },
  { id: 'guard', name: 'Guard', role: 'Proxy', image: guard },
  { id: 'elder', name: 'Elder', role: 'Real subject', image: elder },
] as const;

function RequestScene({ phase, hasLetter }: { phase: Phase | 'idle'; hasLetter: boolean })
{
  const checking = phase === 'verify-letter';
  const showCloseUp = checking || phase === 'verified';
  const showAntidote = phase === 'answer' || phase === 'relay';
  const showSignal = !showAntidote && phase !== 'helped';
  const closeUp = useRef<HTMLDivElement>(null);
  const portraits = useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    if (phase === 'verify-letter')
    {
      closeUp.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    if (phase === 'answer')
    {
      portraits.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [phase]);

  return (
    <div className="proxy-scene" data-phase={phase} data-letter={hasLetter}>
      {showCloseUp ? (
        <div className="proxy-close-up" ref={closeUp}>
          <LetterComparison checking={checking} />
        </div>
      ) : (
        <div className="proxy-actors" ref={portraits}>
          {actors.map(actor => (
            <div key={actor.id} className="proxy-actor" data-actor={actor.id}>
              <img src={actor.image} alt="" draggable={false} />
              <div className="proxy-actor-label">
                <strong>{actor.name}</strong>
                <span>{actor.role}</span>
              </div>
            </div>
          ))}
          {showAntidote && (
            <div key={phase} className="proxy-antidote" aria-hidden="true">
              <span className="proxy-vial" />
              Antidote
            </div>
          )}
        </div>
      )}
      <div className="proxy-route" aria-hidden="true">
        <div className="proxy-track" />
        {actors.map(actor => <span key={actor.id} className="proxy-stop" data-actor={actor.id} />)}
        <span className="proxy-block" />
        {showSignal && <span key={phase} className="proxy-signal" />}
      </div>
    </div>
  );
}

function LetterComparison({ checking }: { checking: boolean })
{
  return (
    <div className="proxy-comparison" data-checking={checking}>
      <div className="proxy-proof-columns">
        <strong>Presented letter</strong>
        <strong>Orven’s old letter</strong>
      </div>
      <div className="proxy-proof-row">
        <div className="proxy-proof-label">{checking ? 'Signature' : 'Signature matches ✓'}</div>
        <div className="proxy-proof-columns">
          <span className="proxy-proof-mark proxy-signature">{wizardLetter.signature}</span>
          <span className="proxy-proof-mark proxy-signature">{oldLetter.signature}</span>
        </div>
      </div>
      <div className="proxy-proof-row" data-proof="seal">
        <div className="proxy-proof-label">{checking ? 'Wax seal' : 'Wax seal matches ✓'}</div>
        <div className="proxy-proof-columns">
          {[wizardLetter.seal, oldLetter.seal].map((seal, index) => (
            <span key={index} className="proxy-proof-mark">
              <span className="proxy-wax-seal" data-seal={seal} role="img" aria-label={`${seal} wax seal`} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [run, setRun] = useState<{
    graph: ConfiguredDemoProps['graph'];
    hasLetter: boolean;
    letterUnlocked: boolean;
    route: NonNullable<ReturnType<typeof simulateRequest>>;
    index: number;
  } | null>(null);

  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  const stage = run?.route[run.index];
  const phase = stage?.phase;
  const playing = Boolean(run && run.index < run.route.length - 1);
  const enabled = ready && active;
  const letterUnlocked = Boolean(run?.letterUnlocked || stage?.phase === 'denied');

  useEffect(() =>
  {
    if (!enabled || !run || !stage || !playing || run.graph !== graph)
    {
      return;
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function advance(skipMotion: boolean)
    {
      setRun(current =>
      {
        if (!current || current !== run)
        {
          return current;
        }
        return { ...current, index: skipMotion ? current.route.length - 1 : current.index + 1 };
      });
    }

    function finishWithoutMotion()
    {
      if (motion.matches)
      {
        advance(true);
      }
    }

    finishWithoutMotion();
    motion.addEventListener('change', finishWithoutMotion);
    const messageDuration = getMessageDuration(stage.message);
    let stageDuration = messageDuration;
    if (stage.phase === 'verify-letter')
    {
      stageDuration = Math.max(messageDuration, minimumVerificationDuration);
    }
    else if (stage.phase === 'answer' || stage.phase === 'relay')
    {
      stageDuration = Math.max(messageDuration, minimumHandoffDuration);
    }
    const timer = window.setTimeout(() => advance(motion.matches), stageDuration);
    return () =>
    {
      window.clearTimeout(timer);
      motion.removeEventListener('change', finishWithoutMotion);
    };
  }, [enabled, graph, playing, run, stage]);

  function startRequest(hasLetter: boolean)
  {
    if (!enabled || playing || (hasLetter && !letterUnlocked))
    {
      return;
    }

    const route = simulateRequest(graph, hasLetter ? wizardLetter : null);
    if (route)
    {
      const index = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? route.length - 1 : 0;
      setRun({ graph, hasLetter, letterUnlocked, route, index });
    }
  }

  return (
    <section className="proxy-demo" aria-labelledby="proxy-demo-title">
      <header className="proxy-introduction">
        <h2 id="proxy-demo-title">Ask the guard for the antidote</h2>
        <p>{antidoteRequest}</p>
      </header>
      <div className="proxy-controls" role="group" aria-label="Request controls">
        <button type="button" disabled={!enabled} aria-disabled={playing} onClick={() => startRequest(false)}>
          Ask without the letter
        </button>
        <button type="button" disabled={!enabled || !letterUnlocked} aria-disabled={playing} onClick={() => startRequest(true)}>
          Ask with the letter
        </button>
        <button type="button" className="proxy-reset" aria-disabled={!run} disabled={!enabled} onClick={() => setRun(null)}>
          Reset
        </button>
      </div>
      <RequestScene phase={phase ?? 'idle'} hasLetter={run?.hasLetter ?? false} />
      <div className="proxy-feedback" data-result={phase}>
        <p role="status" aria-atomic="true">{stage?.message ?? 'The guard waits at the entrance.'}</p>
        <code>{stage?.call ?? 'Audience.requestHelp(request)'}</code>
      </div>
      {playing && run?.hasLetter && (
        <figure className="proxy-letter">
          <figcaption>Orven’s letter</figcaption>
          <blockquote>{wizardLetter.message}</blockquote>
          <p>{wizardLetter.signature} <span aria-hidden="true">✦</span></p>
        </figure>
      )}
    </section>
  );
}
