// Robots.
import { datan2, dhypot } from "dotframe/src/detmath";
import { ENEMY, PLAYER } from "../config";
import type { Game } from "../state";

export function stepEnemies(game: Game): void {
  for (const e of game.enemies) {
    if (!e.alive) continue;
    if (e.hitFrames > 0) e.hitFrames -= 1;
    if (e.cooldown > 0) e.cooldown -= 1;
    if (e.health <= 0) {
      e.alive = false;
      game.kills += 1;
      continue;
    }
    const dx = game.player.x - e.x;
    const dz = game.player.z - e.z;
    const distance = dhypot(dx, dz);
    // Face the player (yaw 0 looks toward -z, the same convention as the player).
    e.yaw = datan2(-dx, -dz);
    if (distance > ENEMY.attackRange) {
      // Walk toward the player; a hit staggers it for a few frames.
      if (e.hitFrames === 0 && distance > 0) {
        e.x += (dx / distance) * ENEMY.speed;
        e.z += (dz / distance) * ENEMY.speed;
      }
    } else if (e.cooldown === 0 && game.player.health > 0) {
      e.cooldown = ENEMY.attackCooldown;
      game.player.health -= ENEMY.attackDamage;
      game.player.hurtFrames = PLAYER.hurtFrames;
    }
  }
}
