import { useEffect, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import type { LessonGraph } from '../../shared/configuredLessonModel';
import { requireClassArtwork } from '../../shared/classArtwork';
import { localize, useLanguage, type Language } from '../../shared/language';
import { config } from '../config/config';
import dreKaar from '../../shared/resource/portraits/dre-kaar.png?url';
import latve from '../../shared/resource/portraits/latve-v2.png?url';
import { createSimulation, type Reaction, type StateId, type StoryEvent, type Transition } from './demoModel';
import { getStateName, StateMachine } from './StateMachine';
import './styles.css';

const images = import.meta.glob<string>('../resource/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const events = [
  { id: 'approach', actor: 'Dre’Kaar', actorRu: 'Дре’Каар', action: 'Approaches', actionRu: 'Приближается', image: dreKaar },
  { id: 'reassure', actor: 'Latve', actorRu: 'Латве', action: 'Reassures Jararis', actionRu: 'Успокаивает Джарариса', image: latve },
] as const;

const reactionText = {
  quiet: { en: 'The snake stays quiet.', ru: 'Змея остаётся спокойной.' },
  hiss: { en: 'The snake gives a warning hiss.', ru: 'Змея предупреждающе шипит.' },
  lunge: { en: 'The snake lunges forward.', ru: 'Змея бросается вперёд.' },
} satisfies Record<Reaction, Record<Language, string>>;

const cardAltRu = {
  jararis: 'Змея обвилась вокруг плеч Джарариса',
  snake: 'Змея Джарариса',
  calm: 'Змея спокойно лежит на плечах Джарариса',
  wary: 'Змея шипит за спиной настороженного Джарариса у костра',
  furious: 'Змея с раскрытой пастью бросается вперёд перед разъярённым Джарарисом',
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

function getCard(id: 'snake' | 'jararis' | StateId, language: Language)
{
  const card = config.classes.find(entry => entry.id === id);
  if (!card)
  {
    throw new Error(`Missing State class card: ${id}`);
  }
  const artwork = requireClassArtwork(card.artwork, card.label);
  return { label: card.label, artwork: { ...artwork, alt: localize(language, artwork.alt, cardAltRu[id]) } };
}

function CallTrace({ event, fromLabel, stateLabel, reaction }: {
  event: StoryEvent | undefined;
  fromLabel: string | undefined;
  stateLabel: string;
  reaction: Reaction | null;
})
{
  const language = useLanguage();
  const calls = localize(language, 'calls', 'вызывает');
  const stores = localize(language, 'and stores', 'и сохраняет состояние');
  return (
    <details className="state-trace">
      <summary>{localize(language, 'See the method calls', 'Посмотреть вызовы методов')}</summary>
      <ol>
        {event && (
          <>
            <li><code>Jararis.handle("{event}")</code> {calls} <code>Snake.handle("{event}")</code>.</li>
            <li>
              <code>Snake.handle("{event}")</code> {localize(language, 'asks', 'вызывает')}{' '}
              <code>{fromLabel}.nextState("{event}")</code> {stores} <code>{stateLabel}</code>.
            </li>
          </>
        )}
        {reaction && (
          <>
            <li><code>Snake.react()</code> {calls} <code>{stateLabel}.react()</code>.</li>
            <li><code>{stateLabel}.react()</code> {localize(language, 'returns', 'возвращает')} <code>"{reaction}"</code>.</li>
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
  const language = useLanguage();
  const caption = localize(language, getCard(id, language).label, id === 'jararis' ? 'Джарарис' : 'Змея');
  return (
    <div className="state-scene-card" data-participant={id} data-highlighted={highlighted}>
      <img src={images[`.${artwork.src}`]} alt={artwork.alt} draggable={false} />
      <span className="state-card-caption">
        <strong>{caption}</strong>
        <span>{detail}</span>
      </span>
    </div>
  );
}

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const language = useLanguage();
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
  const state = getCard(stateId, language);
  const fromLabel = transition ? getCard(transition.from, language).label : undefined;
  const stateName = localize(language, state.label, getStateName(stateId, 'ru'));
  const snakeArtwork = reaction ? state.artwork : getCard('snake', language).artwork;
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

  let status = localize(language, 'Choose a character to start.', 'Выберите персонажа.');
  if (delivery?.phase === 'to-jararis')
  {
    status = delivery.event === 'approach'
      ? localize(language, 'Dre’Kaar approaches Jararis.', 'Дре’Каар подходит к Джарарису.')
      : localize(language, 'Latve reassures Jararis.', 'Латве успокаивает Джарариса.');
  }
  else if (delivery)
  {
    status = localize(language, 'Jararis passes the event to the snake.', 'Джарарис передаёт событие змее.');
  }
  else if (transition)
  {
    status = transition.from === transition.to
      ? localize(language, `The snake stays in ${state.label}.`, `Змея остаётся в состоянии «${stateName}».`)
      : localize(language, `The snake changes from ${fromLabel} to ${state.label}.`,
        `Змея переходит из состояния «${getStateName(transition.from, 'ru')}» в состояние «${stateName}».`);
  }

  return (
    <section className="state-demo" aria-labelledby="state-demo-title">
      <h2 id="state-demo-title">{localize(language, 'Follow the snake’s bond', 'Проследите за связью Джарариса и змеи')}</h2>
      <p>{localize(language,
        'Choose a character. Watch their action reach Jararis, then see how the snake’s current state handles it.',
        'Выберите персонажа и посмотрите, как Джарарис передаёт событие змее и как она реагирует в текущем состоянии.')}</p>

      <div className="state-scene" data-phase={delivery?.phase}>
        <div className="state-events" role="group" aria-label={localize(language, 'Story events', 'События истории')}>
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
                <strong>{localize(language, event.actor, event.actorRu)}</strong>
                <span>{localize(language, event.action, event.actionRu)}</span>
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
          artwork={getCard('jararis', language).artwork}
          detail={localize(language, 'Passes the event', 'Передаёт событие')}
          highlighted={delivery?.phase === 'to-snake'}
        />
        <span className="state-link state-link-snake" data-moving={delivery?.phase === 'to-snake'} aria-hidden="true" />
        <SceneCard
          id="snake"
          artwork={snakeArtwork}
          detail={stateName}
          highlighted={Boolean(transition)}
        />
      </div>

      <div className="state-outcome" role="status">
        <p>{status}</p>
        {reaction && <p>{reactionText[reaction][language]}</p>}
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
          {localize(language, 'Call Snake.react()', 'Вызвать Snake.react()')}
        </button>
        {(transition || reaction) && (
          <CallTrace event={transition?.event} fromLabel={fromLabel} stateLabel={state.label} reaction={reaction} />
        )}
      </div>
    </section>
  );
}
