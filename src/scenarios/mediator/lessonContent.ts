import ravenArt from '../../../docs/hobbit/scenarios/2.2.png?url';
import ravenCard from '../../../docs/hobbit/UML/2.1.png?url';
import dreKaarCard from '../../../docs/hobbit/UML/2.2.png?url';
import faelinaCard from '../../../docs/hobbit/UML/2.4.png?url';
import narionCard from '../../../docs/hobbit/UML/2.6.png?url';
import saerennCard from '../../../docs/hobbit/UML/2.7.png?url';

export const introArt = { src: ravenArt, alt: 'The raven coordinating the companions' };

export const classArtwork: Record<string, { src: string; alt: string }> = {
  raven: { src: ravenCard, alt: 'RavenMediator — the concrete mediator' },
  'dre-kaar': { src: dreKaarCard, alt: 'Dre’Kaar — asks the raven for cover' },
  narion: { src: narionCard, alt: 'Narion — provides covering fire when asked' },
  faelina: { src: faelinaCard, alt: 'Faelina — asks the raven for shelter' },
  saerenn: { src: saerennCard, alt: 'Saerenn — provides shelter when asked' },
};

export const positions: Record<string, { x: number; y: number }> = {
  mediator: { x: 360, y: 0 },
  raven: { x: 0, y: 0 },
  'dre-kaar': { x: 0, y: 390 },
  narion: { x: 360, y: 390 },
  faelina: { x: 0, y: 740 },
  saerenn: { x: 360, y: 740 },
};

export const mediatorDragType = 'application/x-mediator-member';
