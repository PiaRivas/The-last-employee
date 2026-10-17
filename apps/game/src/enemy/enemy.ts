// Robots.
import type { Game } from "../state";

export function stepEnemies(game: Game): void {
  for (const e of game.enemies) {
    if (!e.alive) continue;
    if (e.hitFrames > 0) e.hitFrames -= 1;
    if (e.health <= 0) {
      e.alive = false;
      game.kills += 1;
    }
    // TODO(VS 0.1, enemigo): face the player and react to hits beyond the flash.
  }
}
