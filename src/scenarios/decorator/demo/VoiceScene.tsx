import type { CSSProperties } from 'react';
import foxAsleep from '../resource/fox-asleep.png?url';
import foxAwake from '../resource/fox-awake.png?url';
import latve from '../resource/latve-voice.png?url';
import listenerAlert from '../resource/listener-alert.png?url';
import listenerHypnotized from '../resource/listener-hypnotized.png?url';
import towerCalm from '../resource/tower-calm.png?url';
import towerStorm from '../resource/tower-storm.png?url';
import type { VoiceEffect } from './demoModel';

type Props = {
  playbackId?: number;
  selectedEffects: readonly VoiceEffect[];
  addedEffect?: VoiceEffect;
  effects: Record<VoiceEffect, { image: string }>;
};

function effectTiming(index: number): CSSProperties & { '--effect-index': number }
{
  return { '--effect-index': index };
}

export default function VoiceScene({ playbackId, selectedEffects, addedEffect, effects }: Props)
{
  const sleepIndex = selectedEffects.indexOf('sleep');
  const hypnosisIndex = selectedEffects.indexOf('hypnosis');
  const stormIndex = selectedEffects.indexOf('storm');

  return (
    <div className="decorator-voice-stage" data-adding={addedEffect !== undefined} aria-hidden="true">
      <img className="decorator-landscape" src={towerCalm} alt="" draggable={false} />
      <img
        key={playbackId}
        className="decorator-landscape decorator-storm-landscape"
        data-changed={stormIndex >= 0}
        style={effectTiming(stormIndex)}
        src={towerStorm}
        alt=""
        draggable={false}
      />
      <div className="decorator-portrait decorator-portrait-latve">
        <span className="decorator-portrait-art"><img src={latve} alt="" draggable={false} /></span>
        <span className="decorator-portrait-label">Latve</span>
      </div>
      <div className="decorator-jellyfish-stack">
        {selectedEffects.map(effect => (
          <img
            key={effect}
            data-effect={effect}
            data-arriving={effect === addedEffect}
            src={effects[effect].image}
            alt=""
            draggable={false}
          />
        ))}
      </div>
      <TargetPortrait
        target="fox"
        label="Fox"
        before={foxAwake}
        after={foxAsleep}
        effectIndex={sleepIndex}
        playbackId={playbackId}
      />
      <TargetPortrait
        target="listener"
        label="Listener"
        before={listenerAlert}
        after={listenerHypnotized}
        effectIndex={hypnosisIndex}
        playbackId={playbackId}
      />
      {playbackId !== undefined && (
        <div className="decorator-voice-wave" key={`wave-${playbackId}`}>
          <span className="decorator-wave-ring decorator-wave-core" />
          {selectedEffects.map((effect, index) => (
            <span className="decorator-wave-ring" data-effect={effect} style={effectTiming(index)} key={effect} />
          ))}
        </div>
      )}
    </div>
  );
}

type TargetPortraitProps = {
  target: 'fox' | 'listener';
  label: string;
  before: string;
  after: string;
  effectIndex: number;
  playbackId?: number;
};

function TargetPortrait({ target, label, before, after, effectIndex, playbackId }: TargetPortraitProps)
{
  return (
    <div className={`decorator-portrait decorator-portrait-${target}`}>
      <span className="decorator-portrait-art">
        <img src={before} alt="" draggable={false} />
        <img
          key={playbackId}
          className="decorator-portrait-after"
          data-changed={effectIndex >= 0}
          style={effectTiming(effectIndex)}
          src={after}
          alt=""
          draggable={false}
        />
      </span>
      <span className="decorator-portrait-label">{label}</span>
    </div>
  );
}
