import { useEffect, useMemo, useState } from 'react';
import orcSpider from '../resource/OrcHandler.png?url';
import goblinSpider from '../resource/GoblinHandler.png?url';
import trollSpider from '../resource/TrollHandler.png?url';
import orc from '../resource/orc.png?url';
import goblin from '../resource/goblin.png?url';
import troll from '../resource/troll.png?url';
import harmlessTraveller from '../resource/harmless-traveller.png?url';
import { classLabel, type ChainResult, type ChainStep, type RequestKind } from './demoModel';

const targets = {
  blood: { label: 'Orc', image: orc },
  iron: { label: 'Troll', image: troll },
  step: { label: 'Goblin', image: goblin },
  safe: { label: 'Harmless traveller', image: harmlessTraveller },
};

const targetOrder = ['blood', 'iron', 'step', 'safe'] as const;

const spiders = [
  { id: 'blood', image: orcSpider },
  { id: 'step', image: goblinSpider },
  { id: 'iron', image: trollSpider },
] as const;

type Spider = typeof spiders[number];
type Position = 'entry' | Spider['id'] | 'exit';
type Phase = 'launch' | 'enter' | 'move' | 'visit' | 'drop' | 'bite' | 'caught' | 'exit' | 'done';

type Frame = {
  phase: Phase;
  position: Position;
  duration: number;
  step?: ChainStep;
};

type ChainDemoProps = {
  ready: boolean;
  active: boolean;
  result: ChainResult | null;
  onRun: (request: RequestKind) => void;
};

function getFrames(result: ChainResult | null): Frame[]
{
  if (!result)
  {
    return [];
  }

  const entry = result.trace.find(step => step.handler === 'thread');
  const frames: Frame[] = [
    { phase: 'launch', position: 'entry', duration: 80 },
    { phase: 'enter', position: 'entry', duration: 540, step: entry },
  ];

  for (const step of result.trace)
  {
    const spider = spiders.find(candidate => candidate.id === step.handler);
    if (!spider)
    {
      continue;
    }

    const position = spider.id;
    frames.push(
      { phase: 'move', position, duration: 550 },
      { phase: 'visit', position, duration: 240, step },
    );
    if (step.action === 'handle')
    {
      frames.push(
        { phase: 'drop', position, duration: 440, step },
        { phase: 'bite', position, duration: 210, step },
        { phase: 'caught', position, duration: 350, step },
        { phase: 'done', position, duration: 0, step },
      );
      return frames;
    }
  }

  frames.push(
    { phase: 'exit', position: 'exit', duration: 620 },
    { phase: 'done', position: 'exit', duration: 0 },
  );
  return frames;
}

function TargetPortrait({ request }: { request: RequestKind })
{
  const { label, image } = targets[request];
  return (
    <>
      <img src={image} alt="" draggable={false} />
      <span>{label}</span>
    </>
  );
}

function SpiderCard({ spider, frame }: { spider: Spider; frame: Frame | undefined })
{
  const current = frame?.step?.handler === spider.id ? frame : undefined;
  const descended = current && (
    current.phase === 'drop' || current.phase === 'bite' || current.phase === 'caught'
  );

  return (
    <li
      className="chain-spider"
      data-position={spider.id}
      data-descended={descended}
      data-biting={current?.phase === 'bite'}
      data-action={current?.step?.action}
    >
      <div className="chain-spider-tether" aria-hidden="true" />
      <div className="chain-spider-card">
        <img src={spider.image} alt="" draggable={false} />
        <span>{classLabel(spider.id)}</span>
      </div>
    </li>
  );
}

export function ChainDemo({ ready, active, result, onRun }: ChainDemoProps)
{
  const frames = useMemo(() => getFrames(result), [result]);
  const [progress, setProgress] = useState<{ result: ChainResult; index: number }>();
  const index = progress && progress.result === result ? progress.index : 0;
  const frame = frames[index];
  const playing = Boolean(frame && frame.phase !== 'done');

  useEffect(() =>
  {
    if (!result || !frame?.duration)
    {
      return;
    }

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    function finish()
    {
      if (result)
      {
        setProgress({ result, index: frames.length - 1 });
      }
    }

    if (!active || preference.matches)
    {
      finish();
      return;
    }

    const timer = window.setTimeout(() => setProgress({ result, index: index + 1 }), frame.duration);
    preference.addEventListener('change', finish);
    return () =>
    {
      window.clearTimeout(timer);
      preference.removeEventListener('change', finish);
    };
  }, [active, frame, frames.length, index, result]);

  let status = 'Choose a target to send it through the chain.';
  if (result && frame?.phase === 'done')
  {
    status = result.summary;
  }
  else if (frame)
  {
    status = frame.step?.message ?? 'The target is moving along the trail.';
  }

  return (
    <section className="chain-demo" aria-labelledby="chain-demo-heading">
      <h2 id="chain-demo-heading">Follow the silk thread</h2>
      <p>Choose a target and watch the first matching spider strike.</p>
      {!ready && <p>Complete the class diagram to unlock the demo.</p>}

      <div className="chain-scene">
        <div className="chain-sources" role="group" aria-label="Targets">
          {targetOrder.map(request => (
            <button
              key={request}
              type="button"
              className="chain-source chain-target-card"
              data-target={request}
              data-in-flight={playing && result?.request === request}
              disabled={!ready || !active}
              aria-disabled={playing}
              aria-pressed={result?.request === request}
              onClick={() =>
              {
                if (!playing)
                {
                  onRun(request);
                }
              }}
            >
              <TargetPortrait request={request} />
            </button>
          ))}
        </div>
        <div className="chain-silk" aria-hidden="true" />
        <ol className="chain-spiders" aria-label="Spider handlers in chain order">
          {spiders.map(spider => <SpiderCard key={spider.id} spider={spider} frame={frame} />)}
        </ol>
        {playing && result && frame && (
          <div
            className="chain-target-token"
            data-position={frame.position}
            data-target={result.request}
            data-phase={frame.phase}
            aria-hidden="true"
          >
            <div className="chain-target-card">
              <TargetPortrait request={result.request} />
            </div>
          </div>
        )}
      </div>

      <div className="chain-outcome" role="status">{status}</div>
      {result && !playing && (
        <details className="chain-trace">
          <summary>See the handler calls</summary>
          <ol>
            {result.trace.map(step => <li key={step.handler}>{step.message}</li>)}
          </ol>
        </details>
      )}
    </section>
  );
}
