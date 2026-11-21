import { useEffect, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import narion from '../resource/narion-party-spokesperson.webp';
import guard from '../resource/tish-karr-guard.png';
import elder from '../resource/tish-karr-inside-the-den.png';
import { antidoteRequest, simulateRequest, wizardLetter, type Phase } from './demoModel';
import './styles.css';

const actors = [
  { id: 'narion', name: 'Narion', role: 'Client', image: narion },
  { id: 'guard', name: 'Guard', role: 'Proxy', image: guard },
  { id: 'elder', name: 'Elder', role: 'Real subject', image: elder },
] as const;

const defaultMessageDuration = 4000;
const letterMessageDurations: Partial<Record<Phase, number>> = {
  'check-letter': 4500,
  'verify-letter': 6000,
  verified: 4500,
};

function RequestScene({ phase, hasLetter }: { phase: Phase | 'idle'; hasLetter: boolean })
{
  return (
    <div className="proxy-scene" data-phase={phase} data-letter={hasLetter}>
      <div className="proxy-actors">
        {actors.map(actor => (
          <div key={actor.id} className="proxy-actor" data-actor={actor.id}>
            <img src={actor.image} alt="" draggable={false} />
            <div className="proxy-actor-label">
              <strong>{actor.name}</strong>
              <span>{actor.role}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="proxy-route" aria-hidden="true">
        <div className="proxy-track" />
        {actors.map(actor => <span key={actor.id} className="proxy-stop" data-actor={actor.id} />)}
        <span className="proxy-block" />
        <span key={phase} className="proxy-signal" />
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
    if (!enabled || !run || !phase || !playing || run.graph !== graph)
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
    const messageDuration = letterMessageDurations[phase] ?? defaultMessageDuration;
    const timer = window.setTimeout(() => advance(motion.matches), messageDuration);
    return () =>
    {
      window.clearTimeout(timer);
      motion.removeEventListener('change', finishWithoutMotion);
    };
  }, [enabled, graph, phase, playing, run]);

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
        <p role="status" aria-atomic="true">{stage?.message ?? 'The guard is waiting at the entrance.'}</p>
        <code>{stage?.call ?? 'Audience.requestHelp(request)'}</code>
      </div>
      {run?.hasLetter && (
        <figure className="proxy-letter">
          <figcaption>Orven’s letter</figcaption>
          <blockquote>{wizardLetter.message}</blockquote>
          <p>{wizardLetter.signature} <span aria-hidden="true">✦</span></p>
        </figure>
      )}
    </section>
  );
}
