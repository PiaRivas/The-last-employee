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

// Single player for VS 0.1.
export const PLAYERS = 1;

export function step(game: Game, inputs: number[]): void {
  const input = unpack(inputs[0] ?? 0);
  const pressed = input.buttons & ~game.held;
  game.held = input.buttons;
  game.frame += 1;
  // Unlock only pauses; it never confirms a menu (a blur while paused must not resume).
  const confirmed = pressed & ~Button.Unlock;

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
  if (pressed & (Button.Pause | Button.Unlock)) {
    game.phase = Phase.Paused;
    return;
  }
  stepPlayer(game, input);
  stepCombat(game, confirmed);
  stepEnemies(game);
  if (game.player.health <= 0) game.phase = Phase.Over;
}

// A small summary for dotframe sim --json.
export function state(game: Game): unknown {
  const p = game.player;
  return {
    frame: game.frame,
    phase: game.phase,
    player: { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch, health: p.health },
    fists: game.fists,
    enemies: game.enemies.map((e) => ({ x: e.x, z: e.z, health: e.health, alive: e.alive })),
    kills: game.kills,
  };
}

export function render(game: Game, draw: Draw2D, scene: Scene): void {
  draw.scene(sceneDraws(scene, game));
  drawHud(game, draw);
}
