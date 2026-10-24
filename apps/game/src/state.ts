// The whole simulation state. It changes only inside step() (game.ts and the systems it calls); render only reads it.
// Adding a field? Add it to createGame, snapshot, restore and checksum below, or replays and save/restore drift.
import { createChecksum } from "dotframe/src/checksum";
import { ENEMY, PLAYER } from "./config";

export const Phase = {
  Title: 0,
  Playing: 1,
  Paused: 2,
  Over: 3,
};

export interface Player {
  // Feet position; y is 0 on the floor.
  x: number;
  y: number;
  z: number;
  // View angles, radians. yaw 0 looks toward -z, positive yaw turns left; positive pitch looks up.
  yaw: number;
  pitch: number;
  // Vertical speed, meters per frame (jump).
  vy: number;
  onGround: boolean;
  // Frames left in the current dodge; 0 when not dodging.
  dodgeFrames: number;
  health: number;
  // Frames left in the damage vignette; 0 when healthy.
  hurtFrames: number;
}

export interface Enemy {
  x: number;
  z: number;
  yaw: number;
  health: number;
  // Frames left in the hit reaction; 0 when idle.
  hitFrames: number;
  // Frames until it can swing again.
  cooldown: number;
  alive: boolean;
}

export interface Fists {
  // Frames left in each punch; 0 when the fist is ready.
  left: number;
  right: number;
}

export interface Game {
  frame: number;
  // The seed the run started with, so restart() replays the same run.
  seed: number;
  // Seeded generator state (see rng.ts). Never use Math.random() in the sim.
  rng: number;
  phase: number;
  player: Player;
  enemies: Enemy[];
  fists: Fists;
  kills: number;
  // Current squad number, 1-based, and the countdown to the next squad entering through the door.
  wave: number;
  spawnTimer: number;
  // Buttons held last frame, to detect presses (button went from up to down).
  held: number;
}

function freshEnemy(x: number, z: number): Enemy {
  return {
    x,
    z,
    yaw: 0,
    health: ENEMY.maxHealth,
    hitFrames: 0,
    cooldown: 0,
    alive: true,
  };
}

// A squad queued up in the door corridor: index 0 leads, the rest file in behind.
export function squadEnemy(i: number): Enemy {
  return freshEnemy(0, ENEMY.spawnZ - i * ENEMY.spawnGap);
}

export function createGame(seed: number): Game {
  return {
    frame: 0,
    seed: seed >>> 0,
    rng: seed >>> 0,
    phase: Phase.Title,
    player: {
      x: PLAYER.spawn.x,
      y: 0,
      z: PLAYER.spawn.z,
      yaw: PLAYER.spawn.yaw,
      pitch: 0,
      vy: 0,
      onGround: true,
      dodgeFrames: 0,
      health: PLAYER.maxHealth,
      hurtFrames: 0,
    },
    enemies: Array.from({ length: ENEMY.waveSize }, (_, i) => squadEnemy(i)),
    fists: { left: 0, right: 0 },
    kills: 0,
    wave: 1,
    spawnTimer: 0,
    held: 0,
  };
}

// Restart without reloading: same seed, same run. Keeps the frame counter and held buttons so the press that
// triggered the restart cannot also start the next run.
export function reset(game: Game): void {
  const fresh = createGame(game.seed);
  fresh.frame = game.frame;
  fresh.held = game.held;
  restore(game, fresh);
}

function copyPlayer(p: Player): Player {
  return {
    x: p.x,
    y: p.y,
    z: p.z,
    yaw: p.yaw,
    pitch: p.pitch,
    vy: p.vy,
    onGround: p.onGround,
    dodgeFrames: p.dodgeFrames,
    health: p.health,
    hurtFrames: p.hurtFrames,
  };
}

function copyEnemy(e: Enemy): Enemy {
  return {
    x: e.x,
    z: e.z,
    yaw: e.yaw,
    health: e.health,
    hitFrames: e.hitFrames,
    cooldown: e.cooldown,
    alive: e.alive,
  };
}

// Field by field (scriptc compiles neither structuredClone nor Object.assign).
export function snapshot(game: Game): Game {
  return {
    frame: game.frame,
    seed: game.seed,
    rng: game.rng,
    phase: game.phase,
    player: copyPlayer(game.player),
    enemies: game.enemies.map(copyEnemy),
    fists: { left: game.fists.left, right: game.fists.right },
    kills: game.kills,
    wave: game.wave,
    spawnTimer: game.spawnTimer,
    held: game.held,
  };
}

export function restore(game: Game, saved: Game): void {
  game.frame = saved.frame;
  game.seed = saved.seed;
  game.rng = saved.rng;
  game.phase = saved.phase;
  game.player = copyPlayer(saved.player);
  game.enemies = saved.enemies.map(copyEnemy);
  game.fists = { left: saved.fists.left, right: saved.fists.right };
  game.kills = saved.kills;
  game.wave = saved.wave;
  game.spawnTimer = saved.spawnTimer;
  game.held = saved.held;
}

export function checksum(game: Game): number {
  const p = game.player;
  const sum = createChecksum()
    .add(game.frame)
    .add(game.seed)
    .add(game.rng)
    .add(game.phase)
    .add(p.x)
    .add(p.y)
    .add(p.z)
    .add(p.yaw)
    .add(p.pitch)
    .add(p.vy)
    .add(p.onGround ? 1 : 0)
    .add(p.dodgeFrames)
    .add(p.health)
    .add(p.hurtFrames)
    .add(game.fists.left)
    .add(game.fists.right)
    .add(game.kills)
    .add(game.wave)
    .add(game.spawnTimer)
    .add(game.held);
  for (const e of game.enemies)
    sum
      .add(e.x)
      .add(e.z)
      .add(e.yaw)
      .add(e.health)
      .add(e.hitFrames)
      .add(e.cooldown)
      .add(e.alive ? 1 : 0);
  return sum.value();
}
