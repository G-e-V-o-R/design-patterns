import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { config } from '../config/config';

export const voiceEffects = ['sleep', 'hypnosis', 'storm'] as const;
export type VoiceEffect = typeof voiceEffects[number];

type Utterance = {
  words: string;
  effects: VoiceEffect[];
};

interface Voice {
  speak(): Utterance;
}

class LatveVoice implements Voice
{
  speak(): Utterance
  {
    return { words: 'It starts with the voice.', effects: [] };
  }
}

abstract class JellyfishDecorator implements Voice
{
  constructor(private readonly wrapped: Voice)
  {
  }

  speak(): Utterance
  {
    return this.wrapped.speak();
  }
}

class SleepDecorator extends JellyfishDecorator
{
  speak(): Utterance
  {
    const utterance = super.speak();
    return { ...utterance, effects: [...utterance.effects, 'sleep'] };
  }
}

class HypnosisDecorator extends JellyfishDecorator
{
  speak(): Utterance
  {
    const utterance = super.speak();
    return { ...utterance, effects: [...utterance.effects, 'hypnosis'] };
  }
}

class StormDecorator extends JellyfishDecorator
{
  speak(): Utterance
  {
    const utterance = super.speak();
    return { ...utterance, effects: [...utterance.effects, 'storm'] };
  }
}

const decorators: Record<VoiceEffect, new (wrapped: Voice) => Voice> = {
  sleep: SleepDecorator,
  hypnosis: HypnosisDecorator,
  storm: StormDecorator,
};

export function speakWithEffects(graph: LessonGraph, effects: readonly VoiceEffect[]): Utterance | null
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }

  const voice = effects.reduce<Voice>((wrapped, effect) => new decorators[effect](wrapped), new LatveVoice());
  return voice.speak();
}
