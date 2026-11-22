import { demoConfig } from './demoModel';
import raven from '../resource/raven-card.png?url';
import dreKaar from '../../shared/resource/portraits/dre-kaar.png?url';
import narion from '../../shared/resource/portraits/narion.png?url';
import faelina from '../../shared/resource/portraits/faelina.png?url';
import saerenn from '../../shared/resource/portraits/saerenn.png?url';

const images = { raven, 'dre-kaar': dreKaar, narion, faelina, saerenn };
export type ActorId = keyof typeof images;

export function actorArtwork(id: ActorId)
{
  const card = demoConfig.classes.find(candidate => candidate.id === id);
  return { src: images[id], alt: card?.artwork?.alt ?? card?.label ?? id };
}
