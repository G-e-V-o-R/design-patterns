import wakeArt from '../resource/wake-beetle.webp?url';
import trapsArt from '../resource/traps-beetle.webp?url';
import flankArt from '../resource/flank-beetle.webp?url';
import type { OrderId } from './demoModel';

export const childBeetleArt: Record<OrderId, string> = {
  wake: wakeArt,
  traps: trapsArt,
  flank: flankArt,
};
