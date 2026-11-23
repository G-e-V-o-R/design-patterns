import { localize, useLanguage, type Language } from '../../shared/language';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { classLabel, describeCoordination, type CoordinationResult, type RequestKind } from './demoModel';
import { actorArtwork, type ActorId } from './demoArtwork';

type Phase = 'idle' | 'sending' | 'routing' | 'forwarding' | 'delivered';

const travelTime = 850;
const routingTime = 650;
const playbackSteps = [
  { phase: 'routing', delay: travelTime },
  { phase: 'forwarding', delay: travelTime + routingTime },
  { phase: 'delivered', delay: travelTime * 2 + routingTime },
] as const;

const participants = {
  'dre-kaar': { nameRu: 'Дре’Каар', description: { en: 'Requests cover', ru: 'Просит о прикрытии' } },
  faelina: { nameRu: 'Фаэлина', description: { en: 'Requests shelter', ru: 'Просит об укрытии' } },
  narion: { nameRu: 'Нарион', description: { en: 'Provides covering fire', ru: 'Прикрывает огнём' } },
  saerenn: { nameRu: 'Саэренн', description: { en: 'Guides the group to shelter', ru: 'Ведёт отряд в укрытие' } },
};

type ParticipantId = keyof typeof participants;

function actorName(id: ActorId, language: Language)
{
  if (id === 'raven')
  {
    return localize(language, 'Raven', 'Ворон');
  }
  return localize(language, classLabel(id), participants[id].nameRu);
}

const senders: ParticipantId[] = ['dre-kaar', 'faelina'];

type MediatorDemoProps = {
  ready: boolean;
  active: boolean;
  result: CoordinationResult | null;
  onRun: (request: RequestKind) => void;
};

export function MediatorDemo({ ready, active, result, onRun }: MediatorDemoProps)
{
  const language = useLanguage();
  const [animationKey, setAnimationKey] = useState(0);
  const [playback, setPlayback] = useState<{ run: number; phase: Phase } | null>(null);
  const [showDirectMesh, setShowDirectMesh] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

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

  const presentation = result && language === 'ru' ? describeCoordination(result.request, language) : result;
  let phase: Phase = 'idle';
  if (result)
  {
    phase = 'delivered';
    if (active && !reducedMotion && !showDirectMesh && playback?.run === animationKey)
    {
      phase = playback.phase;
    }
  }

  useEffect(() =>
  {
    if (!result || !active || reducedMotion || showDirectMesh)
    {
      setPlayback(null);
      return;
    }

    const timers = playbackSteps.map(step => window.setTimeout(() =>
    {
      setPlayback(current => current?.run === animationKey
        ? { run: animationKey, phase: step.phase }
        : current);
    }, step.delay));

    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [active, animationKey, reducedMotion, result, showDirectMesh]);

  function runRequest(request: RequestKind)
  {
    setShowDirectMesh(false);
    setAnimationKey(animationKey + 1);
    setPlayback({ run: animationKey + 1, phase: 'sending' });
    onRun(request);
  }

  return (
    <section className="med-demo" aria-labelledby="mediator-demo-heading">
      <header className="med-header">
        <div>
          <h2 id="mediator-demo-heading">{localize(language, 'Through the raven', 'Через Ворона')}</h2>
          <p>{localize(language, 'Send a thought. Raven decides which companion can help.', 'Отправьте мысленное сообщение. Ворон решит, кто из спутников может помочь.')}</p>
        </div>
        <button
          type="button"
          className="med-contrast-button"
          aria-pressed={showDirectMesh}
          onClick={() => setShowDirectMesh(current => !current)}
        >
          {localize(language, 'Direct connections', 'Прямые связи')}
        </button>
      </header>

      {!ready && (
        <p className="med-notice">
          {localize(language, 'Finish your diagram to try both requests.', 'Завершите диаграмму, чтобы попробовать оба запроса.')}
        </p>
      )}

      {showDirectMesh
        ? <DirectConnectionsScene active={active} />
        : (
          <>
            <div className="med-actions" role="group" aria-label={localize(language, 'Send a request', 'Отправить запрос')}>
              <RequestButton
                request="cover"
                sender="dre-kaar"
                label={localize(language, 'Request cover', 'Попросить прикрытие')}
                selected={result?.request === 'cover'}
                disabled={!ready || !active}
                onRun={runRequest}
              />
              <RequestButton
                request="shelter"
                sender="faelina"
                label={localize(language, 'Request shelter', 'Попросить укрытие')}
                selected={result?.request === 'shelter'}
                disabled={!ready || !active}
                onRun={runRequest}
              />
            </div>

            <ActorScene result={result} phase={phase} active={active} animationKey={animationKey} />
            <DispatchStatus result={presentation} phase={phase} />

            {result && (
              <details className="med-trace">
                <summary>{localize(language, 'See the method calls', 'Посмотреть вызовы методов')}</summary>
                <ol>
                  {result.trace.map((step, index) => <li key={step}>{presentation?.trace[index]}</li>)}
                </ol>
              </details>
            )}
          </>
        )}

      <p className="med-comparison">
        {localize(
          language,
          'Observer shares an event with active subscribers. Here, Mediator coordinates a particular request and chooses the recipient.',
          'Наблюдатель сообщает о событии всем активным подписчикам. Здесь посредник обрабатывает конкретный запрос и выбирает его получателя.',
        )}
      </p>
    </section>
  );
}

function RequestButton({ request, sender, label, selected, disabled, onRun }: {
  request: RequestKind;
  sender: ParticipantId;
  label: string;
  selected: boolean;
  disabled: boolean;
  onRun: (request: RequestKind) => void;
})
{
  const language = useLanguage();
  return (
    <button
      type="button"
      className={`med-request med-request-${request}`}
      data-selected={selected}
      disabled={disabled}
      onClick={() => onRun(request)}
    >
      <img src={actorArtwork(sender).src} alt="" />
      <span>
        <small>{actorName(sender, language)}</small>
        <strong>{label}</strong>
      </span>
    </button>
  );
}

const dispatchSteps = [
  { en: 'Request sent', ru: 'Запрос отправлен' },
  { en: 'Raven routes', ru: 'Ворон выбирает адресата' },
  { en: 'Response delivered', ru: 'Ответ получен' },
] as const;

function DispatchStatus({ result, phase }: { result: CoordinationResult | null; phase: Phase })
{
  const language = useLanguage();
  let status = localize(language, 'Choose a request to see who Raven calls on.', 'Выберите запрос, чтобы увидеть, к кому обратится Ворон.');
  if (result)
  {
    const isCover = result.request === 'cover';
    const requestName = isCover ? 'прикрытие' : 'укрытие';
    const recipientName = isCover ? 'Нариону' : 'Саэренн';
    switch (phase)
    {
      case 'sending':
        status = localize(
          language,
          `${classLabel(result.sender)} sends a request for ${result.request}.`,
          isCover ? 'Дре’Каар просит Ворона о прикрытии.' : 'Фаэлина просит Ворона найти укрытие.',
        );
        break;
      case 'routing':
        status = localize(
          language,
          `Raven checks who can provide ${result.request}.`,
          `Ворон выясняет, кто может обеспечить ${requestName}.`,
        );
        break;
      case 'forwarding':
        status = localize(
          language,
          `Raven forwards the request to ${classLabel(result.recipient)}.`,
          `Ворон передаёт запрос ${recipientName}.`,
        );
        break;
      case 'delivered':
        status = result.summary;
        break;
    }
  }

  let currentStep = -1;
  if (phase === 'sending')
  {
    currentStep = 0;
  }
  else if (phase === 'routing' || phase === 'forwarding')
  {
    currentStep = 1;
  }
  else if (phase === 'delivered')
  {
    currentStep = 2;
  }

  return (
    <div className="med-dispatch">
      <ol className="med-dispatch-steps" aria-label={localize(language, 'Request progress', 'Ход запроса')}>
        {dispatchSteps.map((label, index) => (
          <li
            key={label.en}
            aria-current={index === currentStep ? 'step' : undefined}
            data-complete={index < currentStep}
          >
            {label[language]}
          </li>
        ))}
      </ol>
      <p className="med-demo-status" role="status">{status}</p>
    </div>
  );
}

const directConnections: [ParticipantId, ParticipantId][] = [
  ['dre-kaar', 'narion'],
  ['dre-kaar', 'faelina'],
  ['dre-kaar', 'saerenn'],
  ['narion', 'faelina'],
  ['narion', 'saerenn'],
  ['faelina', 'saerenn'],
];

function DirectConnectionsScene({ active }: { active: boolean })
{
  const language = useLanguage();
  const arrowMarkerId = useId();
  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRefs = useRef<Record<ParticipantId, HTMLElement | null>>({
    'dre-kaar': null,
    narion: null,
    faelina: null,
    saerenn: null,
  });
  const [links, setLinks] = useState<{ id: string; path: string }[]>([]);
  useLayoutEffect(() =>
  {
    const scene = sceneRef.current;
    if (!active || !scene)
    {
      return;
    }

    function updateLinks()
    {
      const currentScene = sceneRef.current;
      if (!currentScene)
      {
        return;
      }

      const sceneBounds = currentScene.getBoundingClientRect();
      const nextLinks = directConnections.flatMap(([sourceId, targetId]) =>
      {
        const source = actorRefs.current[sourceId];
        const target = actorRefs.current[targetId];
        if (!source || !target)
        {
          return [];
        }

        const sourceBounds = source.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();
        return [
          {
            id: `${sourceId}-to-${targetId}`,
            path: getDirectArrowPath(sourceBounds, targetBounds, sceneBounds, 5),
          },
          {
            id: `${targetId}-to-${sourceId}`,
            path: getDirectArrowPath(targetBounds, sourceBounds, sceneBounds, -5),
          },
        ];
      });

      setLinks(nextLinks);
    }

    updateLinks();
    const resizeObserver = new ResizeObserver(updateLinks);
    resizeObserver.observe(scene);
    return () => resizeObserver.disconnect();
  }, [active, language]);

  return (
    <section
      className="med-direct-demo"
      aria-labelledby="med-direct-heading"
    >
      <header>
        <h3 id="med-direct-heading">{localize(language, 'Everyone must coordinate with everyone', 'Каждый связывается с каждым')}</h3>
        <p>{localize(language, 'Each companion must coordinate directly with the other three.', 'Каждому спутнику нужно договариваться напрямую с тремя остальными.')}</p>
      </header>
      <div
        className="med-direct-scene"
        ref={sceneRef}
        aria-label={localize(language, 'Four companions with six bidirectional connections', 'Четыре спутника и шесть двусторонних связей между ними')}
      >
        {links.length > 0 && (
          <svg
            className="med-direct-links"
            viewBox={`0 0 ${sceneRef.current?.clientWidth ?? 0} ${sceneRef.current?.clientHeight ?? 0}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id={arrowMarkerId}
                markerWidth="7"
                markerHeight="8"
                markerUnits="userSpaceOnUse"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path className="med-direct-arrowhead" d="M0 0 L7 4 L0 8 Z" />
              </marker>
            </defs>
            {links.map(({ id, path }) => (
              <path
                key={id}
                d={path}
                className="med-direct-link"
                markerEnd={`url(#${arrowMarkerId})`}
              />
            ))}
          </svg>
        )}
        {Object.entries(participants).map(([id, { description }]) => (
          <ActorCard
            key={id}
            id={id as ParticipantId}
            description={description[language]}
            actorRef={element =>
            {
              actorRefs.current[id as ParticipantId] = element;
            }}
          />
        ))}
      </div>
      <p className="med-direct-summary" role="status" aria-live="polite">
        {localize(language, 'Twelve arrows show the message directions across six direct connections.', 'Двенадцать стрелок показывают направления сообщений по шести прямым связям.')}
      </p>
    </section>
  );
}

type Spoke = { id: ParticipantId; path: string };

function ActorScene({ result, phase, active, animationKey }: {
  result: CoordinationResult | null;
  phase: Phase;
  active: boolean;
  animationKey: number;
})
{
  const language = useLanguage();
  const markerId = useId();
  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRefs = useRef<Partial<Record<ActorId, HTMLElement | null>>>({});
  const [geometry, setGeometry] = useState<{ viewBox: string; spokes: Spoke[] } | null>(null);
  const participantIds = Object.keys(participants) as ParticipantId[];

  useLayoutEffect(() =>
  {
    const scene = sceneRef.current;
    if (!scene || !active)
    {
      return;
    }

    function updateSpokes()
    {
      const board = sceneRef.current?.getBoundingClientRect();
      const raven = actorRefs.current.raven?.getBoundingClientRect();
      if (!board || !raven)
      {
        return;
      }

      const spokes = (Object.keys(participants) as ParticipantId[]).flatMap(id =>
      {
        const actor = actorRefs.current[id]?.getBoundingClientRect();
        if (!actor)
        {
          return [];
        }

        const incoming = senders.includes(id);
        const actorPort = {
          x: (incoming ? actor.right : actor.left) - board.left,
          y: actor.top + actor.height / 2 - board.top,
        };
        const upperRow = id === 'dre-kaar' || id === 'narion';
        const ravenPort = {
          x: (incoming ? raven.left : raven.right) - board.left,
          y: raven.top + raven.height * (upperRow ? 0.31 : 0.69) - board.top,
        };

        const [start, end] = incoming ? [actorPort, ravenPort] : [ravenPort, actorPort];
        const midpoint = (start.x + end.x) / 2;
        const path = `M ${start.x} ${start.y} C ${midpoint} ${start.y} ${midpoint} ${end.y} ${end.x} ${end.y}`;
        return [{ id, path }];
      });

      setGeometry({ viewBox: `0 0 ${board.width} ${board.height}`, spokes });
    }

    updateSpokes();
    const observer = new ResizeObserver(updateSpokes);
    observer.observe(scene);
    Object.values(actorRefs.current).forEach(actor =>
    {
      if (actor)
      {
        observer.observe(actor);
      }
    });
    return () => observer.disconnect();
  }, [active]);

  const isForwarding = phase === 'forwarding' || phase === 'delivered';
  const packetId = phase === 'sending' ? result?.sender : result?.recipient;
  const packetPath = geometry?.spokes.find(spoke => spoke.id === packetId)?.path;
  const packetVisible = packetPath && (phase === 'sending' || phase === 'forwarding');

  return (
    <div className="med-board" data-request={result?.request} data-phase={phase}>
      <div className="med-board-labels" aria-hidden="true">
        <span>{localize(language, 'Requests', 'Запросы')}</span>
        <span>{localize(language, 'Mediator', 'Посредник')}</span>
        <span>{localize(language, 'Responses', 'Ответы')}</span>
      </div>
      <div className="med-actor-scene" aria-label={localize(language, 'Raven and the four companions', 'Ворон и четыре спутника')} ref={sceneRef}>
        {geometry && (
          <svg className="med-message-route" viewBox={geometry.viewBox} aria-hidden="true">
            <defs>
              <marker
                id={markerId}
                markerWidth="7"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path className="med-message-arrow" d="M0 0 L7 4 L0 8 Z" />
              </marker>
            </defs>
            {geometry.spokes.map(({ id, path }) =>
            {
              const lit = id === result?.sender || (isForwarding && id === result?.recipient);
              return (
                <path
                  key={id}
                  d={path}
                  className="med-message-route-line"
                  data-lit={lit}
                  markerEnd={lit ? `url(#${markerId})` : undefined}
                />
              );
            })}
          </svg>
        )}
        {participantIds.map(id =>
        {
          let role: 'Sender' | 'Recipient' | undefined;
          if (id === result?.sender)
          {
            role = 'Sender';
          }
          else if (id === result?.recipient && isForwarding)
          {
            role = 'Recipient';
          }

          return (
            <ActorCard
              key={id}
              id={id}
              description={participants[id].description[language]}
              role={role}
              dimmed={Boolean(result) && id !== result?.sender && id !== result?.recipient}
              actorRef={element => { actorRefs.current[id] = element; }}
            />
          );
        })}
        <ActorCard
          id="raven"
          description={localize(language, 'Chooses who responds', 'Выбирает, кто ответит')}
          actorRef={element => { actorRefs.current.raven = element; }}
        />
        {packetVisible && geometry && (
          <svg
            key={`${animationKey}-${phase}`}
            className="med-message-packet-overlay"
            viewBox={geometry.viewBox}
            aria-hidden="true"
          >
            <g
              className="med-message-packet"
              style={{ offsetPath: `path('${packetPath}')`, animationDuration: `${travelTime}ms` }}
            >
              <circle r="10" />
              <path className="med-message-envelope" d="M-5 -3 H5 V4 H-5 Z M-5 -3 L0 1 L5 -3" />
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}

function getFacingPoint(
  from: DOMRect,
  to: DOMRect,
  sceneBounds: DOMRect,
  edgeOffset = 0,
)
{
  const fromCenterX = from.left + from.width / 2;
  const fromCenterY = from.top + from.height / 2;
  const toCenterX = to.left + to.width / 2;
  const toCenterY = to.top + to.height / 2;

  if (Math.abs(toCenterX - fromCenterX) > Math.abs(toCenterY - fromCenterY))
  {
    return {
      x: (toCenterX > fromCenterX ? from.right : from.left) - sceneBounds.left,
      y: fromCenterY - sceneBounds.top + edgeOffset,
    };
  }

  return {
    x: fromCenterX - sceneBounds.left + edgeOffset,
    y: (toCenterY > fromCenterY ? from.bottom : from.top) - sceneBounds.top,
  };
}

function getDirectArrowPath(
  from: DOMRect,
  to: DOMRect,
  sceneBounds: DOMRect,
  edgeOffset: number,
)
{
  const targetIsRight = from.right <= to.left;
  const targetIsBelow = from.bottom <= to.top;
  const columnsApart = targetIsRight || to.right <= from.left;
  const rowsApart = targetIsBelow || to.bottom <= from.top;

  if (columnsApart && rowsApart)
  {
    // Разные стороны угла разделяют встречные стрелки даже в узком зазоре.
    const cornerInset = 8;
    const startX = (targetIsRight ? from.right : from.left) - sceneBounds.left;
    const startY = (targetIsBelow ? from.bottom - cornerInset : from.top + cornerInset) - sceneBounds.top;
    const endX = (targetIsRight ? to.left + cornerInset : to.right - cornerInset) - sceneBounds.left;
    const endY = (targetIsBelow ? to.top : to.bottom) - sceneBounds.top;
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  const start = getFacingPoint(from, to, sceneBounds, edgeOffset);
  const end = getFacingPoint(to, from, sceneBounds, edgeOffset);
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

function ActorCard({ id, description, role, dimmed = false, actorRef }: {
  id: ActorId;
  description: string;
  role?: 'Sender' | 'Recipient';
  dimmed?: boolean;
  actorRef: (element: HTMLElement | null) => void;
})
{
  const language = useLanguage();
  const artwork = actorArtwork(id, language);
  const isRaven = id === 'raven';

  return (
    <article
      className={`med-actor med-actor-${id}`}
      data-role={role}
      data-dimmed={dimmed}
      ref={actorRef}
    >
      <img src={artwork.src} alt={artwork.alt} />
      <div className="med-actor-copy">
        <h3>{actorName(id, language)}</h3>
        <p>{isRaven ? <code>RavenMediator</code> : description}</p>
        {isRaven && <p>{description}</p>}
      </div>
    </article>
  );
}
