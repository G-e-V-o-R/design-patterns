import { useEffect, useState } from 'react';
import foxPortrait from '../resource/fox-card.png?url';
import narionPortrait from '../resource/narion-card.png?url';
import dreKaarPortrait from '../resource/dre-kaar-card.png?url';
import type { DiscoveryResult } from './demoModel';

const subscribers = [
  { id: 'narion', name: 'Narion', portrait: narionPortrait },
  { id: 'dre-kaar', name: 'Dre’Kaar', portrait: dreKaarPortrait },
] as const;

type Subscriber = typeof subscribers[number];
type Phase = 'idle' | 'checking' | 'sending' | 'finished';
type DeliveryState = 'waiting' | 'disconnected' | 'sending' | 'received';

export type DemoRun = {
  result: DiscoveryResult;
};

type ObserverDemoProps = {
  ready: boolean;
  active: boolean;
  narionSubscribed: boolean;
  onToggleBracelet: () => void;
  onRun: (danger: boolean) => void;
  run: DemoRun | null;
};

function getStatus(phase: Phase, result: DiscoveryResult | undefined)
{
  switch (phase)
  {
    case 'checking':
      return 'The fox checks the path.';
    case 'sending':
      return 'Danger ahead! The fox sends the same warning to each subscribed observer.';
    case 'finished':
      return result?.summary;
    default:
      return 'Choose what the fox finds. Try changing Narion’s bracelet between runs.';
  }
}

function getDeliveryState(subscribed: boolean, receivesMessage: boolean, phase: Phase): DeliveryState
{
  if (!subscribed)
  {
    return 'disconnected';
  }

  if (receivesMessage && phase === 'sending')
  {
    return 'sending';
  }

  if (receivesMessage && phase === 'finished')
  {
    return 'received';
  }

  return 'waiting';
}

function PathControls({ disabled, playing, selection, onRun }: {
  disabled: boolean;
  playing: boolean;
  selection: boolean | undefined;
  onRun: (danger: boolean) => void;
})
{
  return (
    <div className="observer-paths" role="group" aria-label="What does the fox find?">
      <button
        type="button"
        data-path="danger"
        disabled={disabled}
        aria-disabled={playing}
        aria-pressed={selection === true}
        onClick={() => onRun(true)}
      >
        Find danger
      </button>
      <button
        type="button"
        data-path="safe"
        disabled={disabled}
        aria-disabled={playing}
        aria-pressed={selection === false}
        onClick={() => onRun(false)}
      >
        Check a safe path
      </button>
    </div>
  );
}

function FoxCard({ phase, danger }: { phase: Phase; danger: boolean | undefined })
{
  let detail = 'Ready to scout';
  if (phase === 'checking')
  {
    detail = 'Checking the path…';
  }
  else if (phase === 'sending' || (phase === 'finished' && danger))
  {
    detail = 'Danger ahead!';
  }
  else if (phase === 'finished')
  {
    detail = 'The path is safe';
  }

  return (
    <article className="observer-fox" data-phase={phase} data-danger={danger}>
      <img src={foxPortrait} alt="" draggable={false} />
      <div>
        <h3>Fox <span>Subject</span></h3>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function SubscriberCard({ subscriber, subscribed, delivery, response, disabled, playing, onToggleBracelet }: {
  subscriber: Subscriber;
  subscribed: boolean;
  delivery: DeliveryState;
  response: string;
  disabled: boolean;
  playing: boolean;
  onToggleBracelet: () => void;
})
{
  return (
    <article className="observer-person" data-delivery={delivery}>
      <div className="observer-portrait">
        <img src={subscriber.portrait} alt="" draggable={false} />
        <h3>{subscriber.name}</h3>
      </div>
      <div className="observer-person-detail">
        <p className="observer-subscription">
          {subscribed ? 'Subscribed' : 'Unsubscribed'}
        </p>
        <p>{response}</p>
        {subscriber.id === 'narion' && (
          <button
            type="button"
            className="observer-bracelet"
            disabled={disabled}
            aria-disabled={playing}
            aria-pressed={subscribed}
            onClick={onToggleBracelet}
          >
            Narion’s bracelet <span aria-hidden="true">{subscribed ? 'On' : 'Off'}</span>
          </button>
        )}
      </div>
    </article>
  );
}

function DiscoveryTrace({ result }: { result: DiscoveryResult })
{
  return (
    <details className="observer-trace">
      <summary>See the method calls</summary>
      <ol>
        {result.trace.map(step => <li key={step}>{step}</li>)}
      </ol>
    </details>
  );
}

export function ObserverDemo({
  ready,
  active,
  narionSubscribed,
  onToggleBracelet,
  onRun,
  run,
}: ObserverDemoProps)
{
  const [progress, setProgress] = useState<{ run: DemoRun; phase: Phase }>();
  let phase: Phase = 'idle';
  if (run)
  {
    phase = progress?.run === run ? progress.phase : 'checking';
  }

  useEffect(() =>
  {
    if (!run || phase === 'finished')
    {
      return;
    }

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    function finish()
    {
      if (run)
      {
        setProgress({ run, phase: 'finished' });
      }
    }

    if (!active || preference.matches)
    {
      finish();
      return;
    }

    const nextPhase = phase === 'checking' && run.result.danger ? 'sending' : 'finished';
    const delay = phase === 'checking' ? 540 : 900;
    const timer = window.setTimeout(() => setProgress({ run, phase: nextPhase }), delay);

    function updateMotion()
    {
      if (preference.matches)
      {
        window.clearTimeout(timer);
        finish();
      }
    }

    preference.addEventListener('change', updateMotion);
    return () =>
    {
      window.clearTimeout(timer);
      preference.removeEventListener('change', updateMotion);
    };
  }, [active, phase, run]);

  const result = run?.result;
  const disabled = !ready || !active;
  const playing = phase === 'checking' || phase === 'sending';

  function choosePath(danger: boolean)
  {
    if (!disabled && !playing)
    {
      onRun(danger);
    }
  }

  function toggleBracelet()
  {
    if (!disabled && !playing)
    {
      onToggleBracelet();
    }
  }

  return (
    <section className="observer-demo" aria-labelledby="observer-demo-heading">
      <h2 id="observer-demo-heading">Follow the fox’s warning</h2>
      <p>The fox warns everyone wearing a bracelet when it finds danger.</p>
      {!ready && <p>Complete the diagram or show the solution to start.</p>}

      <PathControls disabled={disabled} playing={playing} selection={result?.danger} onRun={choosePath} />
      <div className="observer-scene">
        <FoxCard phase={phase} danger={result?.danger} />
        <div className="observer-deliveries">
          {subscribers.map(subscriber =>
          {
            const subscribed = subscriber.id !== 'narion' || narionSubscribed;
            const receivesMessage = result?.recipients.includes(subscriber.id) ?? false;
            const delivery = getDeliveryState(subscribed, receivesMessage, phase);
            let response = subscribed ? 'Waiting for a warning.' : 'Bracelet is off.';
            if (phase === 'finished' && result)
            {
              response = result.responses[subscriber.id];
            }
            else if (delivery === 'sending')
            {
              response = 'Warning on the way…';
            }

            return (
              <div key={subscriber.id} className="observer-delivery" data-subscriber={subscriber.id}>
                <div className="observer-branch" data-delivery={delivery} aria-hidden="true">
                  {delivery === 'sending' && <span className="observer-pulse" />}
                </div>
                <SubscriberCard
                  subscriber={subscriber}
                  subscribed={subscribed}
                  delivery={delivery}
                  response={response}
                  disabled={disabled}
                  playing={playing}
                  onToggleBracelet={toggleBracelet}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="observer-outcome" role="status">{getStatus(phase, result)}</p>
      {phase === 'finished' && result && <DiscoveryTrace result={result} />}
    </section>
  );
}
