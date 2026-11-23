import { localize, useLanguage } from '../../shared/language';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import hypnosis from '../resource/Hypnosis.png?url';
import latve from '../../shared/resource/portraits/latve-v2.png?url';
import sleep from '../resource/Sleep.png?url';
import storm from '../resource/Storm.png?url';
import { speakWithEffects, voiceEffects, type VoiceEffect } from './demoModel';
import VoiceScene, { jellyfishArrivalMs, voiceWaveMs } from './VoiceScene';
import './styles.css';

type EffectDetails = {
  label: string;
  labelRu: string;
  decorator: string;
  outcome: string;
  outcomeRu: string;
  image: string;
};

const effects: Record<VoiceEffect, EffectDetails> = {
  sleep: {
    label: 'Sleep',
    labelRu: 'Сон',
    decorator: 'SleepDecorator',
    outcome: 'The listeners drift to sleep.',
    outcomeRu: 'Слушатели засыпают.',
    image: sleep,
  },
  hypnosis: {
    label: 'Hypnosis',
    labelRu: 'Гипноз',
    decorator: 'HypnosisDecorator',
    outcome: 'The listeners fall into a trance.',
    outcomeRu: 'Слушатели впадают в транс.',
    image: hypnosis,
  },
  storm: {
    label: 'Storm',
    labelRu: 'Буря',
    decorator: 'StormDecorator',
    outcome: 'A storm gathers around the tower.',
    outcomeRu: 'Вокруг башни поднимается буря.',
    image: storm,
  },
};

type DemoRun = {
  id: number;
  graph: ConfiguredDemoProps['graph'];
  utterance: NonNullable<ReturnType<typeof speakWithEffects>>;
  addedEffect?: VoiceEffect;
};

const speakStepMs = 750;
const wavePauseMs = 250;

function useSpeakStep(playbackId: number | undefined, effectCount: number, addingEffect: boolean)
{
  const [progress, setProgress] = useState<{ playbackId: number; step: number }>();
  const firstStep = addingEffect ? -1 : 0;

  useEffect(() =>
  {
    if (playbackId === undefined)
    {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const arrivalDelay = addingEffect && !reducedMotion ? jellyfishArrivalMs : 0;
    const waveStepMs = reducedMotion ? speakStepMs : voiceWaveMs + wavePauseMs;
    const finalStep = 2 * effectCount + 1;
    const timers = Array.from({ length: finalStep - firstStep }, (_, index) =>
    {
      const step = firstStep + index + 1;
      const callTime = Math.min(step, effectCount) * speakStepMs;
      const waveTime = Math.max(0, step - effectCount) * waveStepMs;
      return window.setTimeout(() => setProgress({ playbackId, step }), arrivalDelay + callTime + waveTime);
    });

    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [playbackId, effectCount, addingEffect, firstStep]);

  if (playbackId === undefined)
  {
    return undefined;
  }

  return progress?.playbackId === playbackId ? progress.step : firstStep;
}

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const language = useLanguage();
  const [run, setRun] = useState<DemoRun | null>(null);
  const nextPlaybackId = useRef(0);
  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  const utterance = run?.graph === graph ? run.utterance : null;
  const selectedEffects = utterance?.effects ?? [];
  const playbackId = utterance ? run?.id : undefined;
  const addedEffect = utterance ? run?.addedEffect : undefined;
  const speakStep = useSpeakStep(playbackId, selectedEffects.length, addedEffect !== undefined);
  const voiceStep = speakStep === undefined ? -1 : speakStep - selectedEffects.length;
  const disabled = !ready || !active;

  function speak(selected: readonly VoiceEffect[], addedEffect?: VoiceEffect)
  {
    if (disabled)
    {
      return;
    }

    const result = speakWithEffects(graph, selected);
    if (result)
    {
      setRun({ id: ++nextPlaybackId.current, graph, utterance: result, addedEffect });
    }
  }

  return (
    <section className="decorator-demo" aria-labelledby="decorator-demo-title">
      <h2 id="decorator-demo-title">{localize(language, 'Layer Latve’s voice', 'Добавьте эффекты к голосу Латве')}</h2>
      <p>{localize(language, 'Each jellyfish wraps the current voice. It calls the voice inside it before adding its own effect.', 'Каждая медуза оборачивает текущий голос. Сначала она вызывает голос внутри себя, а затем добавляет свой эффект.')}</p>

      <div className="decorator-workbench">
        <div className="decorator-palette">
          <h3 id="decorator-jellyfish-title">{localize(language, 'Choose a jellyfish', 'Выберите медузу')}</h3>
          <div className="decorator-controls" role="group" aria-labelledby="decorator-jellyfish-title">
            {voiceEffects.map(effect =>
            {
              const { label, labelRu, image } = effects[effect];
              const added = selectedEffects.includes(effect);
              return (
                <button
                  key={effect}
                  className="decorator-effect"
                  data-effect={effect}
                  type="button"
                  disabled={disabled}
                  aria-disabled={added}
                  aria-label={added
                    ? localize(language, `${label} added`, `Добавлен эффект «${labelRu}»`)
                    : localize(language, `Add ${label}`, `Добавить эффект «${labelRu}»`)}
                  onClick={() =>
                  {
                    if (!added)
                    {
                      speak([...selectedEffects, effect], effect);
                    }
                  }}
                >
                  <img src={image} alt="" draggable={false} />
                  <span className="decorator-effect-caption">
                    <strong>{localize(language, label, labelRu)}</strong>
                    <span>{(added ? localize(language, 'Added', 'Добавлено') : localize(language, '+ Add', '+ Добавить'))}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button className="decorator-plain" type="button" disabled={disabled} onClick={() => speak([])}>
            {localize(language, 'Plain voice', 'Голос без эффектов')}
          </button>
        </div>

        <div className="decorator-action">
          <div className="decorator-voice-heading">
            <h3>{localize(language, 'Latve’s voice in action', 'Голос Латве в действии')}</h3>
            <button
              className="decorator-plain"
              type="button"
              disabled={disabled || !utterance}
              onClick={() => speak(selectedEffects)}
            >
              {localize(language, 'Speak again', 'Произнести ещё раз')}
            </button>
          </div>
          <VoiceScene
            playbackId={playbackId}
            selectedEffects={selectedEffects}
            addedEffect={addedEffect}
            voiceStep={voiceStep}
            effects={effects}
          />
        </div>

        <div className="decorator-scene">
          <h3>{localize(language, 'Voice composition', 'Из чего складывается голос')}</h3>
          <div className="decorator-stack">
            <VoiceComposition playbackId={playbackId} selectedEffects={selectedEffects} step={speakStep} />
          </div>
        </div>
      </div>

      <div className="decorator-outcome" role="status" aria-atomic="true">
        {utterance && <VoiceOutcome utterance={utterance} />}
      </div>
      {utterance && <CallTrace selectedEffects={selectedEffects} />}
    </section>
  );
}

type VoiceCompositionProps = {
  playbackId?: number;
  selectedEffects: readonly VoiceEffect[];
  step?: number;
};

function VoiceComposition({ playbackId, selectedEffects, step }: VoiceCompositionProps)
{
  const depth = selectedEffects.length;
  const returning = step !== undefined && step > depth && step <= 2 * depth;
  const calling = step !== undefined && step >= 0 && step < depth;
  const returnedCount = step === undefined ? 0 : Math.min(depth, Math.max(0, step - depth));
  const currentEffect = calling ? selectedEffects[depth - step - 1] : selectedEffects[returning ? returnedCount - 1 : -1];
  const core = (
    <div className="decorator-core" data-current={step === depth}>
      <img src={latve} alt="" draggable={false} />
      <code>LatveVoice</code>
    </div>
  );

  const layers = selectedEffects.reduce<ReactNode>((wrapped, effect) => (
    <div className="decorator-layer" data-effect={effect} key={effect}>
      <div className="decorator-layer-label" data-current={effect === currentEffect}>
        <img src={effects[effect].image} alt="" draggable={false} />
        <code>{effects[effect].decorator}</code>
      </div>
      {wrapped}
    </div>
  ), core);

  return (
    <>
      {layers}
      <div className="decorator-voice-preview" key={playbackId} aria-hidden="true">
        {step !== undefined && step >= depth && (
          <>
            <span className="decorator-wave-ring decorator-wave-core" />
            {selectedEffects.slice(0, returnedCount).map((effect, index) => (
              <span
                key={effect}
                className="decorator-wave-ring"
                data-effect={effect}
                style={{ '--effect-index': index } as CSSProperties}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}

function VoiceOutcome({ utterance }: Pick<DemoRun, 'utterance'>)
{
  const language = useLanguage();
  return (
    <>
      <p><strong>{localize(language, 'Latve says', 'Латве говорит')}</strong> <q>{localize(language, utterance.words, 'Всё начинается с голоса.')}</q></p>
      {utterance.effects.length === 0 ? (
        <p>{localize(language, 'Her words carry no magical effect.', 'В её словах нет магического эффекта.')}</p>
      ) : (
        <>
          <p>{localize(language, 'Effects in order', 'Порядок эффектов')}</p>
          <ol role="list">
            {utterance.effects.map(effect => (
              <li key={effect} data-effect={effect}>
                <strong>{localize(language, effects[effect].label, effects[effect].labelRu)}</strong>
                <span>{localize(language, effects[effect].outcome, effects[effect].outcomeRu)}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}

function CallTrace({ selectedEffects }: { selectedEffects: readonly VoiceEffect[] })
{
  const language = useLanguage();
  const voice = selectedEffects.reduce(
    (wrapped, effect) => `new ${effects[effect].decorator}(${wrapped})`,
    'new LatveVoice()',
  );
  const callOrder = selectedEffects.map(effect => `${effects[effect].decorator}.speak()`).reverse();
  callOrder.push('LatveVoice.speak()');

  return (
    <details className="decorator-trace">
      <summary>{localize(language, 'See the speak() call', 'Посмотреть вызов speak()')}</summary>
      <p><code>({voice}).speak()</code></p>
      {selectedEffects.length > 0 && (
        <>
          <p><strong>{localize(language, 'Calls inward', 'Вызовы от внешней обёртки к голосу')}</strong> <code>{callOrder.join(' → ')}</code></p>
          <p><strong>{localize(language, 'Effects added on return', 'Эффекты при возврате из вызовов')}</strong> {selectedEffects.map(effect => localize(language, effects[effect].label, effects[effect].labelRu)).join(' → ')}</p>
        </>
      )}
    </details>
  );
}
