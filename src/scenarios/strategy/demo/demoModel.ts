import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { localize, type Language } from '../../shared/language';
import { config } from '../config/config';

type CombatStrategy = {
  fight(language: Language): string;
};

const masks = {
  bear: {
    fight: language => localize(language,
      'The bearer meets the charge head-on and drives the troll back.',
      'Воин встречает тролля лицом к лицу и оттесняет его назад.'),
  },
  serpent: {
    fight: language => localize(language,
      'A serpent-shaped shadow coils around the troll and holds it fast.',
      'Змеиная тень обвивается вокруг тролля и крепко сковывает его.'),
  },
  owl: {
    fight: language => localize(language,
      'The bearer tracks the troll in the dark and strikes when its guard drops.',
      'Воин следит за троллем в темноте и наносит удар, когда тот теряет бдительность.'),
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
