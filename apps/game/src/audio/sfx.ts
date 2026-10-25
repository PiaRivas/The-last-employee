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
    // Publish atomically: a retry after a mid-load 404 must not leave hits half-pushed.
    const hits: number[] = [];
    for (const path of FILES.hits) hits.push(await audio.loadSound(await load(path)));
    const ko = await audio.loadSound(await load(FILES.ko));
    const swing = await audio.loadSound(await load(FILES.swing));
    sfx.hits = hits;
    sfx.ko = ko;
    sfx.swing = swing;
  } catch (error) {
    // A missing sound never stops the game.
    console.warn("sfx:", error);
  }
}

// What play() compares: the few numbers that say something happened.
export interface Before {
  punches: { left: number; right: number }[];
  health: number[];
  alive: boolean[];
  playerHealth: number[];
}

export function before(game: Game): Before {
  return {
    punches: game.players.map((p) => ({ left: p.punchLeft, right: p.punchRight })),
    health: game.enemies.map((e) => e.health),
    alive: game.enemies.map((e) => e.alive),
    playerHealth: game.players.map((p) => p.health),
  };
}

export function play(sfx: Sfx, audio: AudioPlayer, was: Before, game: Game): void {
  const thrown = game.players.some(
    (p, i) =>
      (p.punchLeft === COMBAT.punchFrames && (was.punches[i]?.left ?? 0) !== COMBAT.punchFrames) ||
      (p.punchRight === COMBAT.punchFrames && (was.punches[i]?.right ?? 0) !== COMBAT.punchFrames),
  );
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
  // A player taking damage sounds the same as a robot taking it.
  game.players.forEach((p, i: number): void => {
    const health = was.playerHealth[i] ?? p.health;
    if (p.health < health && sfx.hits.length > 0) {
      const hit = sfx.hits[(game.frame + 1) % sfx.hits.length] ?? -1;
      if (hit >= 0) audio.play(hit, 0.7, 0.9);
    }
  });
}
