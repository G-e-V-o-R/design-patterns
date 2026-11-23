import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { localize, type Language } from '../../shared/language';
import { config } from '../config/config';

type CombatStrategy = {
  fight(language: Language): string;
};

const masks = {
  bear: {
    fight: language => localize(language,
      'The warrior meets the charge head-on and drives the troll back.',
      'Воин встречает тролля лицом к лицу и оттесняет его назад.'),
  },
  snake: {
    fight: language => localize(language,
      'A snake-shaped shadow coils around the troll and holds it fast.',
      'Змеиная тень обвивается вокруг тролля и крепко сковывает его.'),
  },
  owl: {
    fight: language => localize(language,
      'The owl mask lets the warrior see in the dark. He tracks the orc and strikes when its guard drops.',
      'Совиная маска позволяет воину видеть в темноте. Он следит за орком и бьёт, когда тот открывается.'),
  },
} satisfies Record<string, CombatStrategy>;

export type Mask = keyof typeof masks;

export function describeFight(mask: Mask, language: Language): string
{
  return masks[mask].fight(language);
}

export function fightWithMask(graph: LessonGraph, mask: Mask): string | null
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }

  return describeFight(mask, 'en');
}
