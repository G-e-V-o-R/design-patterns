import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { classLabel, type CoordinationResult, type RequestKind } from './model';
import { classArtwork, introArt } from './lessonContent';

type MediatorDemoProps = {
  ready: boolean;
  result: CoordinationResult | null;
  onRun: (request: RequestKind) => void;
};

export function MediatorDemo({ ready, result, onRun }: MediatorDemoProps)
{
  const [animationKey, setAnimationKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() =>
  {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () =>
      setReducedMotion(motionPreference.matches);

    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  function runRequest(request: RequestKind)
  {
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

      <div className="med-before">
        <img src={introArt.src} alt="" />
        <div>
          <small>BEFORE THE RAVEN</small>
          <h3>Scattered in the ambush</h3>
          <p>
            The group is under attack. Without a coordinator, each companion
            reacts alone; requests and help have no clear route.
          </p>
        </div>
      </div>

      <div className="med-actions">
        <button disabled={!ready} onClick={() => runRequest('cover')}>
          Dre’Kaar requests cover
        </button>
        <button disabled={!ready} onClick={() => runRequest('shelter')}>
          Faelina requests shelter
        </button>
      </div>

      <ActorScene
        result={result}
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
        {result?.summary ?? 'Choose a request to follow its route through the raven.'}
      </p>

      {result && (
        <details className="med-trace" open>
          <summary>See the method calls</summary>
          <ol>
            {result.trace.map(step => <li key={step}>{step}</li>)}
          </ol>
        </details>
      )}

      <p className="med-comparison">
        Observer shares an event with active subscribers. Here, Mediator
        coordinates a particular request and chooses the recipient.
      </p>
    </section>
  );
}

function ActorScene({
  result,
  animationKey,
  reducedMotion,
}: {
  result: CoordinationResult | null;
  animationKey: number;
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
  }, [result, animationKey]);

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
            transform={reducedMotion
              ? `translate(${route.endpoint.x} ${route.endpoint.y})`
              : undefined}
          >
            <circle r="14" />
            <path
              className="med-message-envelope"
              d="M-7 -4 H7 V5 H-7 Z M-7 -4 L0 1 L7 -4"
            />
            {!reducedMotion && (
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
  id: keyof typeof classArtwork;
  description: string;
  result: CoordinationResult | null;
  actorRef: (element: HTMLElement | null) => void;
})
{
  const artwork = classArtwork[id];
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
