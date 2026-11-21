import { useEffect, useRef, useState, type CSSProperties } from 'react';
import dreKaarPortrait from '../resource/Dre_Kaar.png?url';
import faelinaPortrait from '../resource/Faelina.png?url';
import latvePortrait from '../resource/Latve.png?url';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import { cookSoup, type CookId } from './demoModel';
import { CookingScene } from './CookingScene';
import './styles.css';

const cooks = [
  { id: 'faelina', name: 'Faelina', ingredient: 'Crushed garlic', portrait: faelinaPortrait },
  { id: 'latve', name: 'Latve', ingredient: 'Fresh herbs', portrait: latvePortrait },
  { id: 'dreKaar', name: 'Dre’Kaar', ingredient: 'Smoked pepper', portrait: dreKaarPortrait },
] as const satisfies readonly { id: CookId; name: string; ingredient: string; portrait: string }[];

const stageDisplay = {
  'cookMeat()': { label: 'Add meat and simmer', duration: 2100 },
  'addSeasoning()': { label: 'Season the soup', duration: 1600 },
  'addVegetables()': { label: 'Finish with vegetables', duration: 1700 },
};

const defaultSteps = cookSoup('faelina');

type Cook = typeof cooks[number];

type CookingRun = {
  id: number;
  graph: ConfiguredDemoProps['graph'];
  cook: Cook;
  steps: ReturnType<typeof cookSoup>;
};

function RecipeCard({ cook, selected, disabled, onStart }: {
  cook: Cook;
  selected: boolean;
  disabled: boolean;
  onStart: () => void;
})
{
  return (
    <button
      className="template-recipe"
      type="button"
      data-cook={cook.id}
      disabled={disabled}
      aria-pressed={selected}
      onClick={onStart}
    >
      <img src={cook.portrait} alt="" draggable={false} />
      <span className="template-recipe-caption">
        <strong>{cook.name}</strong>
        <span>{cook.ingredient}</span>
      </span>
    </button>
  );
}

function CookingSequence({ run, stepIndex }: { run: CookingRun | null; stepIndex: number })
{
  const steps = run?.steps ?? defaultSteps;
  const step = steps[stepIndex];
  const finished = run && !step;
  let status = 'Choose a cook to start the recipe.';
  if (run)
  {
    status = step?.detail ?? `${run.cook.name}’s soup is ready to serve.`;
  }

  return (
    <section className="template-sequence" aria-labelledby="template-sequence-title">
      <div className="template-sequence-header">
        <h3 id="template-sequence-title"><code>SoupRecipe.cookSoup()</code></h3>
        {finished && <span className="template-served">Soup ready</span>}
      </div>
      <ol className="template-stages" role="list">
        {steps.map(({ method }, index) =>
        {
          const { label, duration } = stageDisplay[method];
          const current = Boolean(run && stepIndex === index);
          const completed = Boolean(run && stepIndex > index);
          const override = method === 'addSeasoning()';
          return (
            <li
              key={method}
              data-override={override}
              data-completed={completed}
              aria-current={current ? 'step' : undefined}
            >
              <span className="template-stage-marker" aria-hidden="true">{completed ? '✓' : index + 1}</span>
              <div className="template-stage-text">
                <span className="template-stage-kind">{override ? 'Overridden step' : 'Fixed step'}</span>
                <strong>{override && run ? run.cook.ingredient : label}</strong>
                <code>{method}</code>
                {completed && <span className="template-sr-only">Completed</span>}
              </div>
              {current && (
                <span
                  className="template-stage-heat"
                  style={{ '--template-stage-duration': `${duration}ms` } as CSSProperties}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="template-cooking-status" role="status" aria-atomic="true">
        {status}
      </p>
      {finished && run && (
        <details className="template-trace">
          <summary>View recipe trace</summary>
          <ol>
            {run.steps.map(({ method, detail }) => (
              <li key={method}><code>{method}</code> {detail}</li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const nextRunId = useRef(0);
  const [run, setRun] = useState<CookingRun | null>(null);
  const [progress, setProgress] = useState<{ run: CookingRun; index: number } | null>(null);
  if (run && run.graph !== graph)
  {
    setRun(null);
    setProgress(null);
  }
  const currentRun = run?.graph === graph ? run : null;
  const stepIndex = progress?.run === currentRun ? progress.index : 0;
  const step = currentRun?.steps[stepIndex];
  const finished = Boolean(currentRun && !step);

  useEffect(() =>
  {
    if (!currentRun || !step)
    {
      return;
    }

    const runToPlay = currentRun;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function finish()
    {
      setProgress({ run: runToPlay, index: runToPlay.steps.length });
    }

    if (!active || motion.matches)
    {
      finish();
      return;
    }

    const timer = window.setTimeout(
      () => setProgress({ run: runToPlay, index: stepIndex + 1 }),
      stageDisplay[step.method].duration,
    );
    function handleMotionChange(event: MediaQueryListEvent)
    {
      if (event.matches)
      {
        window.clearTimeout(timer);
        finish();
      }
    }

    motion.addEventListener('change', handleMotionChange);
    return () =>
    {
      window.clearTimeout(timer);
      motion.removeEventListener('change', handleMotionChange);
    };
  }, [active, currentRun, step, stepIndex]);

  return (
    <section
      className="template-demo"
      aria-labelledby="template-demo-title"
      data-cook={currentRun?.cook.id}
      data-playing={Boolean(step)}
    >
      <h2 id="template-demo-title">Campfire soup</h2>
      <div className="template-cooks" role="group" aria-label="Choose a cook">
        {cooks.map(cook => (
          <RecipeCard
            key={cook.id}
            cook={cook}
            selected={currentRun?.cook.id === cook.id}
            disabled={!ready || !active}
            onStart={() => setRun({ id: ++nextRunId.current, graph, cook, steps: cookSoup(cook.id) })}
          />
        ))}
      </div>
      <div className="template-workbench">
        <CookingScene
          key={currentRun?.id}
          cook={currentRun?.cook.id}
          method={step?.method}
          duration={step && stageDisplay[step.method].duration}
          finished={finished}
        />
        <CookingSequence run={currentRun} stepIndex={stepIndex} />
      </div>
    </section>
  );
}
