import { localize, type Language } from '../../shared/language';
import { demoConfig } from './demoModel';
import raven from '../resource/raven-card.png?url';
import dreKaar from '../../shared/resource/portraits/dre-kaar.png?url';
import narion from '../../shared/resource/portraits/narion.png?url';
import faelina from '../../shared/resource/portraits/faelina.png?url';
import saerenn from '../../shared/resource/portraits/saerenn.png?url';

const images = { raven, 'dre-kaar': dreKaar, narion, faelina, saerenn };
export type ActorId = keyof typeof images;

const imageDescriptions = {
  raven: 'RavenMediator — конкретный посредник',
  'dre-kaar': 'Дре’Каар просит Ворона о прикрытии',
  narion: 'Нарион прикрывает огнём, когда его просят',
  faelina: 'Фаэлина просит Ворона найти укрытие',
  saerenn: 'Саэренн находит укрытие, когда её просят',
} satisfies Record<ActorId, string>;

export function actorArtwork(id: ActorId, language: Language = 'en')
{
  const card = demoConfig.classes.find(candidate => candidate.id === id);
  return { src: images[id], alt: localize(language, card?.artwork?.alt ?? card?.label ?? id, imageDescriptions[id]) };
}
