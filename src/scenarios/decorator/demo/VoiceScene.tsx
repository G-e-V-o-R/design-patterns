import type { CSSProperties } from 'react';
import foxAsleep from '../resource/fox-asleep.png?url';
import foxAwake from '../resource/fox-awake.png?url';
import latve from '../../shared/resource/portraits/latve-v2.png?url';
import listenerAlert from '../resource/listener-alert.png?url';
import listenerHypnotized from '../resource/listener-hypnotized.png?url';
import towerCalm from '../resource/tower-calm.png?url';
import towerStorm from '../resource/tower-storm.png?url';
import type { VoiceEffect } from './demoModel';

export const jellyfishArrivalMs = 460;
export const voiceWaveMs = 1250;

type Props = {
  playbackId?: number;
  selectedEffects: readonly VoiceEffect[];
  addedEffect?: VoiceEffect;
  voiceStep: number;
  effects: Record<VoiceEffect, { image: string }>;
};

export default function VoiceScene({ playbackId, selectedEffects, addedEffect, voiceStep, effects }: Props)
{
  const sleepIndex = selectedEffects.indexOf('sleep');
  const hypnosisIndex = selectedEffects.indexOf('hypnosis');
  const stormIndex = selectedEffects.indexOf('storm');
  const currentEffect = selectedEffects[voiceStep - 1];
  const showWave = voiceStep === 0 || currentEffect !== undefined;
  const ringClass = voiceStep === 0 ? 'decorator-wave-ring decorator-wave-core' : 'decorator-wave-ring';
  const stageTiming = {
    '--jellyfish-arrival': `${jellyfishArrivalMs}ms`,
    '--voice-duration': `${voiceWaveMs}ms`,
  } as CSSProperties;

  return (
    <div
      className="decorator-voice-stage"
      style={stageTiming}
      aria-hidden="true"
    >
      <img className="decorator-landscape" src={towerCalm} alt="" draggable={false} />
      <img
        key={playbackId}
        className="decorator-landscape decorator-storm-landscape"
        data-changed={stormIndex >= 0 && stormIndex < voiceStep}
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
        effectApplied={sleepIndex >= 0 && sleepIndex < voiceStep}
        playbackId={playbackId}
      />
      <TargetPortrait
        target="listener"
        label="Listener"
        before={listenerAlert}
        after={listenerHypnotized}
        effectApplied={hypnosisIndex >= 0 && hypnosisIndex < voiceStep}
        playbackId={playbackId}
      />
      {showWave && (
        <div className="decorator-voice-wave" key={`wave-${playbackId}-${voiceStep}`}>
          <span className={ringClass} data-effect={currentEffect} />
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
  effectApplied: boolean;
  playbackId?: number;
};

function TargetPortrait({ target, label, before, after, effectApplied, playbackId }: TargetPortraitProps)
{
  return (
    <div className={`decorator-portrait decorator-portrait-${target}`}>
      <span className="decorator-portrait-art">
        <img src={before} alt="" draggable={false} />
        <img
          key={playbackId}
          className="decorator-portrait-after"
          data-changed={effectApplied}
          src={after}
          alt=""
          draggable={false}
        />
      </span>
      <span className="decorator-portrait-label">{label}</span>
    </div>
  );
}
