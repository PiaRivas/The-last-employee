// The frame: step() runs the systems in a fixed order, render() draws the scene and the HUD on top.
// Each system lives in its own folder (player/, enemy/, combat/, world/, ui/, render/); numbers live in config.ts.
import type { Draw2D } from "dotframe/src/draw2d";
import { stepCombat } from "./combat/combat";
import { stepEnemies } from "./enemy/enemy";
import { Button, unpack } from "./input";
import { stepPlayer } from "./player/player";
import { sceneDraws, type Scene } from "./render/scene";
import { type Game, Phase, reset } from "./state";
import { drawHud } from "./ui/hud";

export { WINDOW } from "./config";
export { encode, randomInput } from "./input";
export { checksum, createGame, type Game, reset, restore, snapshot } from "./state";

// Two ports: one employee each. In solo mode port 1 is not active.
export const PLAYERS = 2;

export function step(game: Game, inputs: number[]): void {
  const ins = game.players.map((_, i) => unpack(inputs[i] ?? 0));
  // pressed: buttons that went down this frame, per player.
  const pressed = ins.map((input, i) => {
    const p = game.players[i];
    const down = p ? input.buttons & ~p.held : 0;
    if (p) p.held = input.buttons;
    return down;
  });
  game.frame += 1;
  // Any port's action counts for menus; Unlock only pauses, it never confirms.
  const confirmed = pressed.reduce((all, p) => all | (p & ~Button.Unlock), 0);

  if (game.phase === Phase.Title) {
    // Any action starts the shift.
    if (confirmed !== 0) game.phase = Phase.Playing;
    return;
  }
  if (game.phase === Phase.Paused) {
    if (confirmed & Button.Restart) reset(game);
    else if (confirmed !== 0) game.phase = Phase.Playing;
    return;
  }
  if (game.phase === Phase.Over) {
    if (confirmed !== 0) reset(game);
    return;
  }

  // Playing.
  if (confirmed & Button.Restart) {
    reset(game);
    return;
  }
  if (pressed.some((p) => (p & (Button.Pause | Button.Unlock)) !== 0)) {
    game.phase = Phase.Paused;
    return;
  }
  game.players.forEach((p, i) => {
    if (!p.active) return;
    stepPlayer(game, p, ins[i]);
    stepCombat(game, p, pressed[i] ?? 0);
  });
  stepEnemies(game);
  const standing = game.players.find((p) => p.active && p.health > 0);
  const fallen = game.players.some((p) => p.active && p.health <= 0);
  if (fallen) {
    game.winner = standing ? game.players.indexOf(standing) : -1;
    game.phase = Phase.Over;
  }
}

// A small summary for dotframe sim --json.
export function state(game: Game): unknown {
  return {
    frame: game.frame,
    phase: game.phase,
    duel: game.duel,
    players: game.players.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      yaw: p.yaw,
      pitch: p.pitch,
      health: p.health,
      active: p.active,
    })),
    enemies: game.enemies.map((e) => ({ x: e.x, z: e.z, health: e.health, alive: e.alive })),
    kills: game.kills,
    wave: game.wave,
    spawnTimer: game.spawnTimer,
    winner: game.winner,
  };
}

// localPort: which employee this screen controls (camera, fists, HUD). status: netplay link for the HUD, null local.
export function render(game: Game, draw: Draw2D, scene: Scene, localPort = 0, status: string | null = null): void {
  draw.scene(sceneDraws(scene, game, localPort));
  drawHud(game, draw, localPort, status);
}
