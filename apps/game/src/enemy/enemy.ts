// Robots.
import { datan2 } from "dotframe/src/detmath";
import type { Game } from "../state";

export function stepEnemies(game: Game): void {
  for (const e of game.enemies) {
    if (!e.alive) continue;
    if (e.hitFrames > 0) e.hitFrames -= 1;
    if (e.health <= 0) {
      e.alive = false;
      game.kills += 1;
    }
    // Face the player (yaw 0 looks toward -z, the same convention as the player).
    e.yaw = datan2(-(game.player.x - e.x), -(game.player.z - e.z));
    // TODO(VS 0.1, enemigo): walk toward the player, attack, and a knockback on hits.
  }
}
