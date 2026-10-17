// The 2D layer drawn over the scene: crosshair, health, kills. Coordinates are WINDOW's logical pixels.
import type { Draw2D } from "dotframe/src/draw2d";
import { PLAYER, WINDOW } from "../config";
import type { Game } from "../state";

export function drawHud(game: Game, draw: Draw2D): void {
  const cx = WINDOW.width / 2;
  const cy = WINDOW.height / 2;
  draw.setFillStyle("#ffffff");
  draw.fillRect(cx - 1, cy - 8, 2, 16);
  draw.fillRect(cx - 8, cy - 1, 16, 2);

  // Health bar, bottom left.
  const health = Math.max(0, game.player.health) / PLAYER.maxHealth;
  draw.setFillStyle("#00000099");
  draw.fillRect(20, WINDOW.height - 36, 204, 18);
  draw.setFillStyle("#e8453c");
  draw.fillRect(22, WINDOW.height - 34, 200 * health, 14);

  // TODO(VS 0.1, UI): kill counter (game.kills). Text needs a font: load an atlas from dotframe/assets/fonts and
  // register it with draw.addFont before the first fillText, or nothing is drawn.
  // TODO(VS 0.1, UI): title screen with instructions, pause overlay and restart (game.phase).
}
