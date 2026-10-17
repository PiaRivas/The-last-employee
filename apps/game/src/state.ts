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
}

export interface Enemy {
  x: number;
  z: number;
  yaw: number;
  health: number;
  // Frames left in the hit reaction; 0 when idle.
  hitFrames: number;
  alive: boolean;
}

export interface Fists {
  // Frames left in each punch; 0 when the fist is ready.
  left: number;
  right: number;
}

export interface Game {
  frame: number;
  // Seeded generator state (see rng.ts). Never use Math.random() in the sim.
  rng: number;
  phase: number;
  player: Player;
  enemies: Enemy[];
  fists: Fists;
  kills: number;
  // Buttons held last frame, to detect presses (button went from up to down).
  held: number;
}

export function createGame(seed: number): Game {
  return {
    frame: 0,
    rng: seed >>> 0,
    // VS 0.1 adds the title screen; until then a match starts playing.
    phase: Phase.Playing,
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
    },
    enemies: [
      {
        x: ENEMY.spawn.x,
        z: ENEMY.spawn.z,
        yaw: 0,
        health: ENEMY.maxHealth,
        hitFrames: 0,
        alive: true,
      },
    ],
    fists: { left: 0, right: 0 },
    kills: 0,
    held: 0,
  };
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
  };
}

function copyEnemy(e: Enemy): Enemy {
  return { x: e.x, z: e.z, yaw: e.yaw, health: e.health, hitFrames: e.hitFrames, alive: e.alive };
}

// Field by field (scriptc compiles neither structuredClone nor Object.assign).
export function snapshot(game: Game): Game {
  return {
    frame: game.frame,
    rng: game.rng,
    phase: game.phase,
    player: copyPlayer(game.player),
    enemies: game.enemies.map(copyEnemy),
    fists: { left: game.fists.left, right: game.fists.right },
    kills: game.kills,
    held: game.held,
  };
}

export function restore(game: Game, saved: Game): void {
  game.frame = saved.frame;
  game.rng = saved.rng;
  game.phase = saved.phase;
  game.player = copyPlayer(saved.player);
  game.enemies = saved.enemies.map(copyEnemy);
  game.fists = { left: saved.fists.left, right: saved.fists.right };
  game.kills = saved.kills;
  game.held = saved.held;
}

export function checksum(game: Game): number {
  const p = game.player;
  const sum = createChecksum()
    .add(game.frame)
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
    .add(game.fists.left)
    .add(game.fists.right)
    .add(game.kills)
    .add(game.held);
  for (const e of game.enemies)
    sum
      .add(e.x)
      .add(e.z)
      .add(e.yaw)
      .add(e.health)
      .add(e.hitFrames)
      .add(e.alive ? 1 : 0);
  return sum.value();
}
