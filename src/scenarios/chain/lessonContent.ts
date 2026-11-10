import chainIntroArt from '../../../docs/hobbit/scenarios/3.png?url';

export const introArt = {
  src: chainIntroArt,
  alt: 'Faelina tending silk threads with spiders in the forest',
};

export const positions: Record<string, { x: number; y: number }> = {
  handler: { x: 280, y: 0 },
  thread: { x: 0, y: 160 },
  blood: { x: 0, y: 360 },
  step: { x: 360, y: 160 },
  iron: { x: 360, y: 360 },
};

export const compactPositions: Record<string, { x: number; y: number }> = {
  handler: { x: 0, y: 0 },
  thread: { x: 0, y: 190 },
  blood: { x: 0, y: 380 },
  step: { x: 0, y: 570 },
  iron: { x: 0, y: 760 },
};

export const chainDragType = 'application/x-chain-member';
