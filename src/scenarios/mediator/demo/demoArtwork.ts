import { demoConfig } from './demoModel';
import raven from '../resource/raven-card.png?url';
import dreKaar from '../resource/dre-kaar-card.png?url';
import narion from '../resource/narion-card.png?url';
import faelina from '../resource/faelina-card.png?url';
import saerenn from '../resource/saerenn-card.png?url';

const images = { raven, 'dre-kaar': dreKaar, narion, faelina, saerenn };
export type ActorId = keyof typeof images;

export function actorArtwork(id: ActorId)
{
  const card = demoConfig.classes.find(candidate => candidate.id === id);
  return { src: images[id], alt: card?.artwork?.alt ?? card?.label ?? id };
}
