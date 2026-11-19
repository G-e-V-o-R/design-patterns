import { useState, type ReactNode } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import hypnosis from '../resource/Hypnosis.png?url';
import latve from '../resource/latve-voice.png?url';
import sleep from '../resource/Sleep.png?url';
import storm from '../resource/Storm.png?url';
import { speakWithEffects, voiceEffects, type VoiceEffect } from './demoModel';
import VoiceScene from './VoiceScene';
import './styles.css';

const effects: Record<VoiceEffect, { label: string; decorator: string; outcome: string; image: string }> = {
  sleep: {
    label: 'Sleep',
    decorator: 'SleepDecorator',
    outcome: 'The listeners drift to sleep.',
    image: sleep,
  },
  hypnosis: {
    label: 'Hypnosis',
    decorator: 'HypnosisDecorator',
    outcome: 'The listeners fall into a trance.',
    image: hypnosis,
  },
  storm: {
    label: 'Storm',
    decorator: 'StormDecorator',
    outcome: 'A storm gathers around the tower.',
    image: storm,
  },
};

type DemoRun = {
  id: number;
  graph: ConfiguredDemoProps['graph'];
  utterance: NonNullable<ReturnType<typeof speakWithEffects>>;
  addedEffect?: VoiceEffect;
};

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [run, setRun] = useState<DemoRun | null>(null);
  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  const utterance = run?.graph === graph ? run.utterance : null;
  const selectedEffects = utterance?.effects ?? [];
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
      setRun(previous => ({ id: (previous?.id ?? 0) + 1, graph, utterance: result, addedEffect }));
    }
  }

  return (
    <section className="decorator-demo" aria-labelledby="decorator-demo-title">
      <h2 id="decorator-demo-title">Layer Latve’s voice</h2>
      <p>Each jellyfish wraps the current voice. It calls the voice inside it before adding its own effect.</p>

      <div className="decorator-workbench">
        <div className="decorator-palette">
          <h3 id="decorator-jellyfish-title">Choose a jellyfish</h3>
          <div className="decorator-controls" role="group" aria-labelledby="decorator-jellyfish-title">
            {voiceEffects.map(effect =>
            {
              const { label, image } = effects[effect];
              const added = selectedEffects.includes(effect);
              return (
                <button
                  key={effect}
                  className="decorator-effect"
                  data-effect={effect}
                  type="button"
                  disabled={disabled}
                  aria-disabled={added}
                  aria-label={added ? `${label} added` : `Add ${label}`}
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
                    <strong>{label}</strong>
                    <span>{added ? 'Added' : '+ Add'}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button className="decorator-plain" type="button" disabled={disabled} onClick={() => speak([])}>
            Plain voice
          </button>
        </div>

        <div className="decorator-action">
          <div className="decorator-voice-heading">
            <h3>Latve’s voice in action</h3>
            <button
              className="decorator-plain"
              type="button"
              disabled={disabled || !utterance}
              onClick={() => speak(selectedEffects)}
            >
              Speak again
            </button>
          </div>
          <VoiceScene
            playbackId={utterance ? run?.id : undefined}
            selectedEffects={selectedEffects}
            addedEffect={utterance ? run?.addedEffect : undefined}
            effects={effects}
          />
        </div>

        <div className="decorator-scene">
          <h3>Voice composition</h3>
          <div className="decorator-stack">
            <VoiceComposition selectedEffects={selectedEffects} />
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

function VoiceComposition({ selectedEffects }: { selectedEffects: readonly VoiceEffect[] })
{
  const core = (
    <div className="decorator-core">
      <img src={latve} alt="" draggable={false} />
      <code>LatveVoice</code>
    </div>
  );

  return selectedEffects.reduce<ReactNode>((wrapped, effect) => (
    <div className="decorator-layer" data-effect={effect} key={effect}>
      <div className="decorator-layer-label">
        <img src={effects[effect].image} alt="" draggable={false} />
        <code>{effects[effect].decorator}</code>
      </div>
      {wrapped}
    </div>
  ), core);
}

function VoiceOutcome({ utterance }: Pick<DemoRun, 'utterance'>)
{
  return (
    <>
      <p><strong>Latve says</strong> <q>{utterance.words}</q></p>
      {utterance.effects.length === 0 ? (
        <p>Her words carry no magical effect.</p>
      ) : (
        <>
          <p>Effects in order</p>
          <ol role="list">
            {utterance.effects.map(effect => (
              <li key={effect} data-effect={effect}>
                <strong>{effects[effect].label}</strong>
                <span>{effects[effect].outcome}</span>
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
  const voice = selectedEffects.reduce(
    (wrapped, effect) => `new ${effects[effect].decorator}(${wrapped})`,
    'new LatveVoice()',
  );

  return (
    <details className="decorator-trace">
      <summary>See the speak() call</summary>
      <p><code>({voice}).speak()</code></p>
    </details>
  );
}
