// Seeded random numbers for the simulation. The generator state lives in Game.rng, so save/restore and replays
// reproduce every roll.
import type { Game } from "./state";

// A number in [0, 1) (mulberry32).
export function random(game: Game): number {
  game.rng = (game.rng + 0x6d2b79f5) >>> 0;
  let t = game.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
