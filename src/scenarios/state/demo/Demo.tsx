import { useEffect, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import type { LessonGraph } from '../../shared/configuredLessonModel';
import { requireClassArtwork } from '../../shared/classArtwork';
import { config } from '../config/config';
import dreKaar from '../../shared/resource/portraits/dre-kaar.png?url';
import latve from '../../shared/resource/portraits/latve-v2.png?url';
import { createSimulation, type Reaction, type StateId, type StoryEvent, type Transition } from './demoModel';
import { StateMachine } from './StateMachine';
import './styles.css';

const images = import.meta.glob<string>('../resource/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const events = [
  { id: 'approach', actor: 'Dre’Kaar', action: 'Approaches', image: dreKaar },
  { id: 'reassure', actor: 'Latve', action: 'Reassures Jararis', image: latve },
] as const;

const reactionText: Record<Reaction, string> = {
  quiet: 'The snake stays quiet.',
  hiss: 'The snake gives a warning hiss.',
  lunge: 'The snake lunges forward.',
};

const hopDuration = 420;

type Delivery = {
  event: StoryEvent;
  phase: 'to-jararis' | 'to-snake';
};

type DemoSession = {
  graph: LessonGraph;
  simulation: ReturnType<typeof createSimulation>;
  delivery: Delivery | null;
  transition: Transition | null;
  reaction: Reaction | null;
};

function startSession(graph: LessonGraph): DemoSession
{
  return { graph, simulation: createSimulation(graph), delivery: null, transition: null, reaction: null };
}

function getCard(id: 'snake' | 'jararis' | StateId)
{
  const card = config.classes.find(entry => entry.id === id);
  if (!card)
  {
    throw new Error(`Missing State class card: ${id}`);
  }
  return { label: card.label, artwork: requireClassArtwork(card.artwork, card.label) };
}

function CallTrace({ event, fromLabel, stateLabel, reaction }: {
  event: StoryEvent | undefined;
  fromLabel: string | undefined;
  stateLabel: string;
  reaction: Reaction | null;
})
{
  return (
    <details className="state-trace">
      <summary>See the method calls</summary>
      <ol>
        {event && (
          <>
            <li><code>Jararis.handle("{event}")</code> calls <code>Snake.handle("{event}")</code>.</li>
            <li>
              <code>Snake.handle("{event}")</code> asks <code>{fromLabel}.nextState("{event}")</code> and stores <code>{stateLabel}</code>.
            </li>
          </>
        )}
        {reaction && (
          <>
            <li><code>Snake.react()</code> calls <code>{stateLabel}.react()</code>.</li>
            <li><code>{stateLabel}.react()</code> returns <code>"{reaction}"</code>.</li>
          </>
        )}
      </ol>
    </details>
  );
}

function SceneCard({ id, artwork, detail, highlighted }: {
  id: 'jararis' | 'snake';
  artwork: ReturnType<typeof getCard>['artwork'];
  detail: string;
  highlighted: boolean;
})
{
  return (
    <div className="state-scene-card" data-participant={id} data-highlighted={highlighted}>
      <img src={images[`.${artwork.src}`]} alt={artwork.alt} draggable={false} />
      <span className="state-card-caption">
        <strong>{getCard(id).label}</strong>
        <span>{detail}</span>
      </span>
    </div>
  );
}

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [savedSession, setSession] = useState(() => startSession(graph));
  let session = savedSession;
  if (savedSession.graph !== graph)
  {
    session = startSession(graph);
    setSession(session);
  }

  const { simulation, delivery, transition, reaction } = session;

  useEffect(() =>
  {
    if (!simulation || !delivery)
    {
      return;
    }

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const { jararis } = simulation;
    const { event, phase } = delivery;
    let timer: number;

    function finish()
    {
      const transition = jararis.handle(event);
      setSession(current => current.delivery === delivery ? { ...current, delivery: null, transition } : current);
    }

    function updateMotion()
    {
      window.clearTimeout(timer);
      if (!active || preference.matches)
      {
        timer = window.setTimeout(finish, 0);
      }
      else if (phase === 'to-jararis')
      {
        const next: Delivery = { event, phase: 'to-snake' };
        timer = window.setTimeout(() =>
        {
          setSession(current => current.delivery === delivery ? { ...current, delivery: next } : current);
        }, hopDuration);
      }
      else
      {
        timer = window.setTimeout(finish, hopDuration);
      }
    }

    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () =>
    {
      window.clearTimeout(timer);
      preference.removeEventListener('change', updateMotion);
    };
  }, [active, delivery, simulation]);

  if (!simulation)
  {
    return null;
  }

  const disabled = !ready || !active;
  const stateId = simulation.snake.stateId;
  const state = getCard(stateId);
  const fromLabel = transition ? getCard(transition.from).label : undefined;
  const snakeArtwork = reaction ? state.artwork : getCard('snake').artwork;
  const source = events.find(event => event.id === (delivery?.event ?? transition?.event));

  function sendEvent(event: StoryEvent)
  {
    if (!disabled && !delivery)
    {
      setSession({ ...session, delivery: { event, phase: 'to-jararis' }, transition: null, reaction: null });
    }
  }

  function react()
  {
    if (!disabled && !delivery && simulation)
    {
      setSession({ ...session, reaction: simulation.snake.react() });
    }
  }

  let status = 'Choose a character to start.';
  if (delivery?.phase === 'to-jararis')
  {
    status = delivery.event === 'approach' ? 'Dre’Kaar approaches Jararis.' : 'Latve reassures Jararis.';
  }
  else if (delivery)
  {
    status = 'Jararis passes the event to the snake.';
  }
  else if (transition)
  {
    status = transition.from === transition.to
      ? `The snake stays in ${state.label}.`
      : `The snake changes from ${fromLabel} to ${state.label}.`;
  }

  return (
    <section className="state-demo" aria-labelledby="state-demo-title">
      <h2 id="state-demo-title">Follow the snake’s bond</h2>
      <p>Choose a character. Watch their action reach Jararis, then see how the snake’s current state handles it.</p>

      <div className="state-scene" data-phase={delivery?.phase}>
        <div className="state-events" role="group" aria-label="Story events">
          {events.map(event => (
            <button
              key={event.id}
              type="button"
              className="state-scene-card state-source"
              data-event={event.id}
              data-highlighted={source?.id === event.id}
              disabled={disabled}
              aria-disabled={Boolean(delivery)}
              onClick={() => sendEvent(event.id)}
            >
              <img src={event.image} alt="" draggable={false} />
              <span className="state-card-caption">
                <strong>{event.actor}</strong>
                <span>{event.action}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="state-source-path" aria-hidden="true">
          {events.map(event => (
            <span
              key={event.id}
              className="state-source-branch"
              data-event={event.id}
              data-lit={delivery?.event === event.id}
            />
          ))}
          <span className="state-link state-link-source" data-moving={delivery?.phase === 'to-jararis'} />
        </div>
        <SceneCard
          id="jararis"
          artwork={getCard('jararis').artwork}
          detail="Passes the event"
          highlighted={delivery?.phase === 'to-snake'}
        />
        <span className="state-link state-link-snake" data-moving={delivery?.phase === 'to-snake'} aria-hidden="true" />
        <SceneCard
          id="snake"
          artwork={snakeArtwork}
          detail={state.label}
          highlighted={Boolean(transition)}
        />
      </div>

      <div className="state-outcome" role="status">
        <p>{status}</p>
        {reaction && <p>{reactionText[reaction]}</p>}
      </div>
      <StateMachine current={stateId} transition={transition} />
      <div className="state-demo-controls">
        <button
          className="state-react-button"
          type="button"
          disabled={disabled}
          aria-disabled={Boolean(delivery)}
          onClick={react}
        >
          Call Snake.react()
        </button>
        {(transition || reaction) && (
          <CallTrace event={transition?.event} fromLabel={fromLabel} stateLabel={state.label} reaction={reaction} />
        )}
      </div>
    </section>
  );
}
