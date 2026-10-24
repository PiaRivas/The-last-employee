// Robots.
import { datan2, dhypot } from "dotframe/src/detmath";
import { ENEMY, PLAYER } from "../config";
import type { Game } from "../state";
import { resolve } from "../world/collision";

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
      // Walk toward the player; a hit staggers it for a few frames. Walls and desks still block.
      if (e.hitFrames === 0 && distance > 0) {
        const moved = resolve(
          e.x + (dx / distance) * ENEMY.speed,
          e.z + (dz / distance) * ENEMY.speed,
          ENEMY.radius,
        );
        e.x = moved.x;
        e.z = moved.z;
      }
      // Robots don't merge: push neighbors apart.
      for (const other of game.enemies) {
        if (other === e || !other.alive) continue;
        const sx = e.x - other.x;
        const sz = e.z - other.z;
        const min = ENEMY.radius * 2;
        const d = dhypot(sx, sz);
        if (d > 0 && d < min) {
          const push = (min - d) / 2;
          e.x += (sx / d) * push;
          e.z += (sz / d) * push;
          other.x -= (sx / d) * push;
          other.z -= (sz / d) * push;
        }
      }
    } else if (e.cooldown === 0 && game.player.health > 0) {
      e.cooldown = ENEMY.attackCooldown;
      game.player.health -= ENEMY.attackDamage;
      game.player.hurtFrames = PLAYER.hurtFrames;
    }
  }
}
