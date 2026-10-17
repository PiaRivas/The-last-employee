// dotframe-allow-math-file: presentation only, never simulation state.
// Sound effects. Sounds are presentation: they never change the game. After each step, play() compares the state
// before and after and plays what happened (a punch thrown, a hit, a robot down).
import type { Audio, AudioPlayer } from "dotframe/src/audio";
import { COMBAT } from "../config";
import type { Game } from "../state";

// Kenney Impact Sounds (CC0), converted to mp3 (the format dotframe decodes on every target). See CREDITS.md.
const FILES = {
  hits: [
    "assets/sfx/impactPunch_medium_000.mp3",
    "assets/sfx/impactPunch_medium_001.mp3",
    "assets/sfx/impactPunch_medium_002.mp3",
  ],
  ko: "assets/sfx/impactMetal_heavy_000.mp3",
  swing: "assets/sfx/impactSoft_medium_000.mp3",
};

// Loaded sound ids; empty or -1 until loaded (and forever where nothing loads them, such as headless runs).
export interface Sfx {
  hits: number[];
  ko: number;
  swing: number;
}

export function createSfx(): Sfx {
  return { hits: [], ko: -1, swing: -1 };
}

export async function loadSfx(
  sfx: Sfx,
  audio: Audio,
  load: (path: string) => Promise<Uint8Array>,
): Promise<void> {
  try {
    for (const path of FILES.hits) sfx.hits.push(await audio.loadSound(await load(path)));
    sfx.ko = await audio.loadSound(await load(FILES.ko));
    sfx.swing = await audio.loadSound(await load(FILES.swing));
  } catch (error) {
    // A missing sound never stops the game.
    console.warn("sfx:", error);
  }
}

// What play() compares: the few numbers that say something happened.
export interface Before {
  left: number;
  right: number;
  health: number[];
  alive: boolean[];
}

export function before(game: Game): Before {
  return {
    left: game.fists.left,
    right: game.fists.right,
    health: game.enemies.map((e) => e.health),
    alive: game.enemies.map((e) => e.alive),
  };
}

export function play(sfx: Sfx, audio: AudioPlayer, was: Before, game: Game): void {
  const thrown =
    (game.fists.left === COMBAT.punchFrames && was.left !== COMBAT.punchFrames) ||
    (game.fists.right === COMBAT.punchFrames && was.right !== COMBAT.punchFrames);
  if (thrown && sfx.swing >= 0) audio.play(sfx.swing, 0.25, 1.4);
  game.enemies.forEach((e, i: number): void => {
    const health = was.health[i] ?? e.health;
    if (e.health < health && sfx.hits.length > 0) {
      // A different punch each time, slightly detuned so repeats do not sound robotic.
      const hit = sfx.hits[game.frame % sfx.hits.length] ?? -1;
      if (hit >= 0) audio.play(hit, 0.9, 0.92 + Math.random() * 0.16);
    }
    if (was.alive[i] === true && !e.alive && sfx.ko >= 0) audio.play(sfx.ko, 1, 1);
  });
}
