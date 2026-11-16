import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { classLabel, type CoordinationResult, type RequestKind } from './demoModel';
import { actorArtwork, type ActorId } from './demoArtwork';

type MediatorDemoProps = {
  ready: boolean;
  active: boolean;
  result: CoordinationResult | null;
  onRun: (request: RequestKind) => void;
};

export function MediatorDemo({ ready, active, result, onRun }: MediatorDemoProps)
{
  const [animationKey, setAnimationKey] = useState(0);
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

  function runRequest(request: RequestKind)
  {
    setShowDirectMesh(false);
    setAnimationKey(key => key + 1);
    onRun(request);
  }

  return (
    <section className="med-demo" aria-labelledby="mediator-demo-heading">
      <p className="med-kicker">TRY THE STORY</p>
      <h2 id="mediator-demo-heading">
        The right request. The right companion.
      </h2>
      <p>The raven owns the routing rule. The sender knows only its mediator.</p>

      {!ready && (
        <p className="med-notice">
          Complete the diagram, or show the solution, to try both requests.
        </p>
      )}

      {showDirectMesh
        ? (
          <>
            <div className="med-actions">
              <button onClick={() => setShowDirectMesh(false)}>
                Back to Mediator demo
              </button>
            </div>
            <DirectConnectionsScene reducedMotion={reducedMotion} active={active} />
          </>
        )
        : (
          <>
            <div className="med-actions">
              <button disabled={!ready} onClick={() => runRequest('cover')}>
                Dre’Kaar requests cover
              </button>
              <button disabled={!ready} onClick={() => runRequest('shelter')}>
                Faelina requests shelter
              </button>
              <button
                type="button"
                className="med-contrast-button"
                onClick={() => setShowDirectMesh(true)}
              >
                See without Mediator
              </button>
            </div>

            <ActorScene
              result={result}
              active={active}
              animationKey={animationKey}
              reducedMotion={reducedMotion}
            />

            {result && (
              <p className="med-route-summary" aria-label="Active request route">
                <strong>{classLabel(result.sender)}</strong>
                <span aria-hidden="true">→</span>
                <strong>RavenMediator</strong>
                <span aria-hidden="true">→</span>
                <strong>{classLabel(result.recipient)}</strong>
              </p>
            )}

            <p className="med-demo-status" role="status" aria-live="polite">
              {result?.summary
                ?? 'Choose a request to follow its route through the raven.'}
            </p>

            {result && (
              <details className="med-trace" open>
                <summary>See the method calls</summary>
                <ol>
                  {result.trace.map(step => <li key={step}>{step}</li>)}
                </ol>
              </details>
            )}
          </>
        )}

      <p className="med-comparison">
        Observer shares an event with active subscribers. Here, Mediator
        coordinates a particular request and chooses the recipient.
      </p>
    </section>
  );
}

type ParticipantId = Exclude<ActorId, 'raven'>;

const directConnections: [ParticipantId, ParticipantId][] = [
  ['dre-kaar', 'narion'],
  ['dre-kaar', 'faelina'],
  ['dre-kaar', 'saerenn'],
  ['narion', 'faelina'],
  ['narion', 'saerenn'],
  ['faelina', 'saerenn'],
];

function DirectConnectionsScene({ reducedMotion, active }: { reducedMotion: boolean; active: boolean })
{
  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRefs = useRef<Record<ParticipantId, HTMLElement | null>>({
    'dre-kaar': null,
    narion: null,
    faelina: null,
    saerenn: null,
  });
  const [links, setLinks] = useState<string[]>([]);
  const participants: {
    id: ParticipantId;
    description: string;
  }[] = [
    { id: 'dre-kaar', description: 'Requests cover' },
    { id: 'narion', description: 'Provides covering fire' },
    { id: 'faelina', description: 'Requests shelter' },
    { id: 'saerenn', description: 'Guides the group to shelter' },
  ];

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
        const start = getFacingPoint(sourceBounds, targetBounds, sceneBounds);
        const end = getFacingPoint(targetBounds, sourceBounds, sceneBounds);
        return [`M ${start.x} ${start.y} L ${end.x} ${end.y}`];
      });

      setLinks(nextLinks);
    }

    updateLinks();
    const resizeObserver = new ResizeObserver(updateLinks);
    resizeObserver.observe(scene);
    return () => resizeObserver.disconnect();
  }, [active]);

  return (
    <section
      className="med-direct-demo"
      aria-labelledby="med-direct-heading"
    >
      <header>
        <p className="med-kicker">WITHOUT A MEDIATOR</p>
        <h3 id="med-direct-heading">Everyone must coordinate with everyone</h3>
        <p>
          Each companion now needs a direct connection to the other three.
          That creates six links to manage instead of one shared coordinator.
        </p>
      </header>
      <div
        className="med-direct-scene"
        ref={sceneRef}
        aria-label="Four companions with six direct connections"
      >
        {links.length > 0 && (
          <svg
            className="med-direct-links"
            viewBox={`0 0 ${sceneRef.current?.clientWidth ?? 0} ${sceneRef.current?.clientHeight ?? 0}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {links.map((path, index) => (
              <path
                key={index}
                d={path}
                className={reducedMotion ? '' : 'med-direct-link'}
              />
            ))}
          </svg>
        )}
        {participants.map(participant => (
          <ActorCard
            key={participant.id}
            id={participant.id}
            description={participant.description}
            result={null}
            actorRef={element =>
            {
              actorRefs.current[participant.id] = element;
            }}
          />
        ))}
      </div>
      <p className="med-direct-summary" role="status" aria-live="polite">
        Six direct connections: every companion must track three peers.
      </p>
    </section>
  );
}

function ActorScene({
  result,
  animationKey,
  reducedMotion,
  active,
}: {
  result: CoordinationResult | null;
  animationKey: number;
  active: boolean;
  reducedMotion: boolean;
})
{
  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRefs = useRef<Record<string, HTMLElement | null>>({});
  const [route, setRoute] = useState<{
    path: string;
    viewBox: string;
    endpoint: { x: number; y: number };
  } | null>(null);

  useLayoutEffect(() =>
  {
    if (!active)
    {
      return;
    }
    const scene = sceneRef.current;
    if (!scene || !result)
    {
      setRoute(null);
      return;
    }

    const currentResult = result;

    function updateRoute()
    {
      const currentScene = sceneRef.current;
      const sender = actorRefs.current[currentResult.sender];
      const mediator = actorRefs.current.raven;
      const recipient = actorRefs.current[currentResult.recipient];
      if (!currentScene || !sender || !mediator || !recipient)
      {
        return;
      }

      const sceneBounds = currentScene.getBoundingClientRect();
      const senderBounds = sender.getBoundingClientRect();
      const mediatorBounds = mediator.getBoundingClientRect();
      const recipientBounds = recipient.getBoundingClientRect();

      const start = getFacingPoint(senderBounds, mediatorBounds, sceneBounds);
      const entry = getFacingPoint(mediatorBounds, senderBounds, sceneBounds);
      const exit = getFacingPoint(mediatorBounds, recipientBounds, sceneBounds);
      const end = getFacingPoint(recipientBounds, mediatorBounds, sceneBounds);

      const path = [
        `M ${start.x} ${start.y}`,
        `C ${start.x + (entry.x - start.x) * 0.45} ${start.y}`,
        `${entry.x - (entry.x - start.x) * 0.45} ${entry.y} ${entry.x} ${entry.y}`,
        `L ${exit.x} ${exit.y}`,
        `C ${exit.x + (end.x - exit.x) * 0.45} ${exit.y}`,
        `${end.x - (end.x - exit.x) * 0.45} ${end.y} ${end.x} ${end.y}`,
      ].join(' ');

      setRoute({
        path,
        viewBox: `0 0 ${sceneBounds.width} ${sceneBounds.height}`,
        endpoint: {
          x: end.x,
          y: end.y,
        },
      });
    }

    updateRoute();
    const resizeObserver = new ResizeObserver(updateRoute);
    resizeObserver.observe(scene);
    return () => resizeObserver.disconnect();
  }, [result, animationKey, active]);

  return (
    <div
      className={`med-actor-scene ${result ? `med-actor-scene-${result.request}` : ''}`}
      aria-label="All Mediator characters"
      ref={sceneRef}
    >
      {result && route && (
        <svg
          className="med-message-route"
          viewBox={route.viewBox}
          preserveAspectRatio="none"
          aria-hidden="true"
          key={animationKey}
        >
          <defs>
            <marker
              id="med-message-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#e5ca87" />
            </marker>
          </defs>
          <path
            d={route.path}
            className="med-message-route-line"
            markerEnd="url(#med-message-arrow)"
          />
        </svg>
      )}
      {result && route && (
        <svg
          className="med-message-packet-overlay"
          viewBox={route.viewBox}
          preserveAspectRatio="none"
          aria-hidden="true"
          key={`packet-${animationKey}`}
        >
          <g
            className="med-message-packet"
            transform={reducedMotion || !active
              ? `translate(${route.endpoint.x} ${route.endpoint.y})`
              : undefined}
          >
            <circle r="14" />
            <path
              className="med-message-envelope"
              d="M-7 -4 H7 V5 H-7 Z M-7 -4 L0 1 L7 -4"
            />
            {!reducedMotion && active && (
              <animateMotion
                path={route.path}
                dur="2.4s"
                keyTimes="0;0.4;0.6;1"
                keyPoints="0;0.48;0.52;1"
                calcMode="linear"
                fill="freeze"
              />
            )}
          </g>
        </svg>
      )}
      <ActorCard
        id="dre-kaar"
        description="Requests cover"
        result={result}
        actorRef={element => { actorRefs.current['dre-kaar'] = element; }}
      />
      <ActorCard
        id="raven"
        description="Routes each request"
        result={result}
        actorRef={element => { actorRefs.current.raven = element; }}
      />
      <ActorCard
        id="narion"
        description="Provides covering fire"
        result={result}
        actorRef={element => { actorRefs.current.narion = element; }}
      />
      <ActorCard
        id="faelina"
        description="Requests shelter"
        result={result}
        actorRef={element => { actorRefs.current.faelina = element; }}
      />
      <ActorCard
        id="saerenn"
        description="Guides the group to shelter"
        result={result}
        actorRef={element => { actorRefs.current.saerenn = element; }}
      />
    </div>
  );
}

function getFacingPoint(
  from: DOMRect,
  to: DOMRect,
  sceneBounds: DOMRect,
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
      y: fromCenterY - sceneBounds.top,
    };
  }

  return {
    x: fromCenterX - sceneBounds.left,
    y: (toCenterY > fromCenterY ? from.bottom : from.top) - sceneBounds.top,
  };
}

function ActorCard({
  id,
  description,
  result,
  actorRef,
}: {
  id: ActorId;
  description: string;
  result: CoordinationResult | null;
  actorRef: (element: HTMLElement | null) => void;
})
{
  const artwork = actorArtwork(id);
  const isMediator = id === 'raven';
  let actorClassName = `med-actor med-actor-${id}`;

  if (isMediator)
  {
    actorClassName += ' med-actor-mediator';
  }
  else if (result?.sender === id)
  {
    actorClassName += ' med-actor-sender';
  }
  else if (result?.recipient === id)
  {
    actorClassName += ' med-actor-recipient';
  }
  else if (result)
  {
    actorClassName += ' med-actor-inactive';
  }

  let actorRole = 'PARTICIPANT';
  if (isMediator)
  {
    actorRole = 'MEDIATOR';
  }
  else if (result?.sender === id)
  {
    actorRole = 'SENDER';
  }
  else if (result?.recipient === id)
  {
    actorRole = 'RECIPIENT';
  }

  return (
    <article className={actorClassName} ref={actorRef}>
      <img src={artwork.src} alt={artwork.alt} />
      <div className="med-actor-copy">
        <small>{actorRole}</small>
        <h3>{isMediator ? 'RavenMediator' : classLabel(id)}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
