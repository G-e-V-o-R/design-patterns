import { useEffect, useState } from 'react';
import type { DiscoveryResult } from './demoModel';

export type DemoRun = {
  id: number;
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

export function ObserverDemo({
  ready,
  active,
  narionSubscribed,
  onToggleBracelet,
  onRun,
  run,
}: ObserverDemoProps)
{
  return (
    <section className="observer-demo" aria-labelledby="demo-heading">
      <DemoHeading />
      <SubscriberSummary narionSubscribed={narionSubscribed} />
      {!ready && <DiagramReadinessMessage />}
      <DiscoveryScene
        key={getSceneKey(run)}
        ready={ready}
        active={active}
        run={run}
        narionSubscribed={narionSubscribed}
        onRun={onRun}
        onToggleBracelet={onToggleBracelet}
      />
    </section>
  );
}

function DemoHeading()
{
  return (
    <div className="demo-heading">
      <div>
        <p className="lesson-kicker">TRY THE STORY</p>
        <h2 id="demo-heading">Who gets the message?</h2>
      </div>
      <p>The Subject publishes a notification only when it sees danger.</p>
    </div>
  );
}

function SubscriberSummary({ narionSubscribed }: { narionSubscribed: boolean })
{
  let activeObservers = 'Dre’Kaar';
  if (narionSubscribed)
  {
    activeObservers = 'Narion, Dre’Kaar';
  }

  return (
    <p className="demo-subscribers">
      <code>observers: Observer[]</code>
      <span>Attached observers: {activeObservers}</span>
    </p>
  );
}

function DiagramReadinessMessage()
{
  return (
    <p className="demo-help">
      Complete the diagram or show the solution to run discovery.
    </p>
  );
}

function DiscoveryControls({
  ready,
  onRun,
}: {
  ready: boolean;
  onRun: (danger: boolean) => void;
})
{
  return (
    <div className="demo-controls">
      <button disabled={!ready} onClick={() => onRun(true)}>Find danger</button>
      <button disabled={!ready} onClick={() => onRun(false)}>Check a safe path</button>
    </div>
  );
}

function getSceneKey(run: DemoRun | null)
{
  if (!run)
  {
    return 'idle';
  }

  return run.id;
}

type DiscoverySceneProps = {
  ready: boolean;
  active: boolean;
  run: DemoRun | null;
  narionSubscribed: boolean;
  onRun: (danger: boolean) => void;
  onToggleBracelet: () => void;
};

type DiscoveryPhase = 'idle' | 'checking' | 'sending' | 'finished';

function DiscoveryScene({
  ready,
  active,
  run,
  narionSubscribed,
  onRun,
  onToggleBracelet,
}: DiscoverySceneProps)
{
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase, setPhase] = useState<DiscoveryPhase>(() =>
    getInitialPhase(run));

  useEffect(() =>
  {
    if (!active)
    {
      return;
    }
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () =>
      setReducedMotion(motionPreference.matches);

    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, [active]);

  const shownPhase = getShownPhase(reducedMotion, run, phase);

  useEffect(() =>
  {
    if (!active || !run || phase === 'finished')
    {
      return;
    }

    if (reducedMotion)
    {
      setPhase('finished');
      return;
    }

    let nextPhase: DiscoveryPhase = 'finished';
    let delayInMilliseconds = 1400;
    if (phase === 'checking')
    {
      delayInMilliseconds = 650;
      if (run.result.danger)
      {
        nextPhase = 'sending';
      }
    }

    const timerId = window.setTimeout(() =>
    {
      setPhase(nextPhase);
    }, delayInMilliseconds);

    return () => window.clearTimeout(timerId);
  }, [run, phase, reducedMotion, active]);

  const result = run?.result;
  const isFinished = shownPhase === 'finished';
  const statusMessage = getStatusMessage(shownPhase, result);

  return (
    <>
      <p
        className="demo-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </p>
      <DiscoveryControls ready={ready} onRun={onRun} />
      <div className="demo-stage" data-phase={shownPhase}>
        <FoxCard phase={shownPhase} result={result} isFinished={isFinished} />
        {(['narion', 'dre-kaar'] as const).map(subscriberId => (
          <SubscriberDelivery
            key={subscriberId}
            subscriberId={subscriberId}
            phase={shownPhase}
            result={result}
            isFinished={isFinished}
            narionSubscribed={narionSubscribed}
            onToggleBracelet={onToggleBracelet}
          />
        ))}
      </div>
      {isFinished && result && <DiscoveryTrace result={result} />}
    </>
  );
}

function getInitialPhase(run: DemoRun | null): DiscoveryPhase
{
  if (run)
  {
    return 'checking';
  }

  return 'idle';
}

function getShownPhase(
  reducedMotion: boolean,
  run: DemoRun | null,
  phase: DiscoveryPhase,
): DiscoveryPhase
{
  if (reducedMotion && run)
  {
    return 'finished';
  }

  return phase;
}

function getStatusMessage(
  phase: DiscoveryPhase,
  result: DiscoveryResult | undefined,
)
{
  if (phase === 'checking')
  {
    return 'The Subject is checking the path.';
  }

  if (phase === 'sending')
  {
    return 'Danger ahead! The Subject is publishing a notification.';
  }

  if (phase === 'finished' && result)
  {
    return result.summary;
  }

  return 'Choose a path to see what the Subject does.';
}

function FoxCard({
  phase,
  result,
  isFinished,
}: {
  phase: DiscoveryPhase;
  result: DiscoveryResult | undefined;
  isFinished: boolean;
})
{
  let foxStatus = 'Looking for danger';
  if (phase === 'checking')
  {
    foxStatus = 'Checking the path…';
  }
  else if (result && isFinished)
  {
    if (result.danger)
    {
      foxStatus = 'Danger ahead!';
    }
    else
    {
      foxStatus = 'The path is safe.';
    }
  }

  return (
    <article className="demo-fox">
      <span aria-hidden="true">🦊</span>
      <h3>Fox</h3>
      <p>Subject</p>
      <p>{foxStatus}</p>
    </article>
  );
}

type SubscriberId = 'narion' | 'dre-kaar';

function SubscriberDelivery({
  subscriberId,
  phase,
  result,
  isFinished,
  narionSubscribed,
  onToggleBracelet,
}: {
  subscriberId: SubscriberId;
  phase: DiscoveryPhase;
  result: DiscoveryResult | undefined;
  isFinished: boolean;
  narionSubscribed: boolean;
  onToggleBracelet: () => void;
})
{
  const isNarion = subscriberId === 'narion';
  const isSubscribed = !isNarion || narionSubscribed;
  const receivesMessage = result?.recipients.includes(subscriberId) ?? false;
  const pathLabel = getDeliveryLabel(phase, isSubscribed, receivesMessage, isFinished);
  let pathClassName = 'demo-message-path';
  if (!isSubscribed)
  {
    pathClassName += ' is-off';
  }

  let personClassName = 'demo-person';
  if (isFinished && receivesMessage)
  {
    personClassName += ' has-message';
  }

  return (
    <div className="demo-delivery">
      <div className={pathClassName} aria-hidden="true">
        <span className="demo-path-label">{pathLabel}</span>
        {phase === 'sending' && receivesMessage && (
          <span className="demo-message-dot" />
        )}
        <span className="demo-path-arrow">→</span>
      </div>
      <article className={personClassName}>
        <SubscriberCard
          subscriberId={subscriberId}
          isNarion={isNarion}
          isSubscribed={isSubscribed}
          result={result}
          isFinished={isFinished}
          onToggleBracelet={onToggleBracelet}
        />
      </article>
    </div>
  );
}

function getDeliveryLabel(
  phase: DiscoveryPhase,
  isSubscribed: boolean,
  receivesMessage: boolean,
  isFinished: boolean,
)
{
  if (phase === 'sending' && receivesMessage)
  {
    return 'Message';
  }

  if (isFinished && receivesMessage)
  {
    return 'Sent';
  }

  if (isFinished)
  {
    return 'No message';
  }

  if (!isSubscribed)
  {
    return 'Off';
  }

  return 'Ready';
}

function SubscriberCard({
  subscriberId,
  isNarion,
  isSubscribed,
  result,
  isFinished,
  onToggleBracelet,
}: {
  subscriberId: SubscriberId;
  isNarion: boolean;
  isSubscribed: boolean;
  result: DiscoveryResult | undefined;
  isFinished: boolean;
  onToggleBracelet: () => void;
})
{
  const subscriberName = getSubscriberName(subscriberId);
  const response = getSubscriberResponse(
    subscriberId,
    isSubscribed,
    result,
    isFinished,
  );

  return (
    <>
      <h3>{subscriberName}</h3>
      {isNarion && (
        <NarionBracelet
          isSubscribed={isSubscribed}
          onToggleBracelet={onToggleBracelet}
        />
      )}
      {!isNarion && <p className="demo-bracelet-state">Bracelet on · subscribed</p>}
      {isNarion && (
        <NarionSubscriptionState isSubscribed={isSubscribed} />
      )}
      <p className="demo-response">{response}</p>
    </>
  );
}

function getSubscriberName(subscriberId: SubscriberId)
{
  if (subscriberId === 'narion')
  {
    return 'Narion';
  }

  return 'Dre’Kaar';
}

function NarionBracelet({
  isSubscribed,
  onToggleBracelet,
}: {
  isSubscribed: boolean;
  onToggleBracelet: () => void;
})
{
  let buttonLabel = 'Put on bracelet';
  if (isSubscribed)
  {
    buttonLabel = 'Take off bracelet';
  }

  return (
    <button
      className="demo-bracelet"
      aria-pressed={isSubscribed}
      aria-label="Narion’s bracelet"
      onClick={onToggleBracelet}
    >
      <span aria-hidden="true">◯</span> {buttonLabel}
    </button>
  );
}

function NarionSubscriptionState({ isSubscribed }: { isSubscribed: boolean })
{
  let subscriptionText = 'Bracelet off · unsubscribed';
  if (isSubscribed)
  {
    subscriptionText = 'Bracelet on · subscribed';
  }

  return <p className="demo-bracelet-state">{subscriptionText}</p>;
}

function getSubscriberResponse(
  subscriberId: SubscriberId,
  isSubscribed: boolean,
  result: DiscoveryResult | undefined,
  isFinished: boolean,
)
{
  if (isFinished && result)
  {
    return result.responses[subscriberId];
  }

  if (isSubscribed)
  {
    return 'Waiting for a message.';
  }

  return 'No messages while the bracelet is off.';
}

function DiscoveryTrace({ result }: { result: DiscoveryResult })
{
  return (
    <details className="demo-trace">
      <summary>See the method calls</summary>
      <ol>
        {result.trace.map((step, stepIndex) => (
          <li key={stepIndex}>{step}</li>
        ))}
      </ol>
    </details>
  );
}
