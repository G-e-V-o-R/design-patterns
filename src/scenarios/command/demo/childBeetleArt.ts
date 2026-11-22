import amberBeetle from '../resource/wake-beetle.webp?url';
import greenBeetle from '../resource/traps-beetle.webp?url';
import blueBeetle from '../resource/flank-beetle.webp?url';
import type { OrderId } from './demoModel';

export const childBeetleArt: Record<OrderId, string> = {
  wake: blueBeetle,
  traps: greenBeetle,
  flank: amberBeetle,
};
