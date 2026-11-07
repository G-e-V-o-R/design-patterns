import foxCard from '../../../docs/hobbit/UML/1.8.png?url';
import narionCard from '../../../docs/hobbit/UML/1.5.png?url';
import dreKaarCard from '../../../docs/hobbit/UML/1.1.png?url';
import { classCards } from './model';

export const classArtwork: Record<string, { src: string; alt: string }> = {
  publisher: {
    src: foxCard,
    alt: 'Fox — the publisher',
  },
  narion: {
    src: narionCard,
    alt: 'Narion — a concrete subscriber',
  },
  'dre-kaar': {
    src: dreKaarCard,
    alt: 'Dre’Kaar — a concrete subscriber',
  },
};

export const positions: Record<string, { x: number; y: number }> = {
  publisher: { x: 0, y: 0 },
  subscriber: { x: 390, y: 0 },
  narion: { x: 0, y: 480 },
  'dre-kaar': { x: 390, y: 480 },
};

export const hints = [
  'Give FoxPublisher the subscribers: Subscriber[] field to store active subscribers. Also give it subscribe(), unsubscribe(), notify(), and discoverDanger(). Looking for danger is its business logic.',
  'Subscriber is an interface with update(discovery). Each concrete subscriber implements this method. It has its own business logic to decide what to do.',
  'FoxPublisher keeps a list of Subscriber. NarionSubscriber and DreKaarSubscriber both implement Subscriber. Connect the fox to this interface. It does not need a link to each concrete class.',
];

export const methodDragType = 'application/x-observer-method';

export function label(id: string)
{
  const matchingCard = classCards.find(classCard => classCard.id === id);
  if (matchingCard)
  {
    return matchingCard.label;
  }

  return id;
}
