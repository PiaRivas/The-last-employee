// Robots.
import { datan2, dhypot } from "dotframe/src/detmath";
import { ENEMY, OFFICE, PLAYER } from "../config";
import { type Game, squadEnemy } from "../state";
import { resolve } from "../world/collision";

// Inside the corridor the player is out of reach anyway: bots aim at the door first, then at the player.
const DOOR_MOUTH_Z = -(OFFICE.halfDepth - OFFICE.wallThickness / 2);

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
    const inCorridor = e.z < DOOR_MOUTH_Z;
    const tx = inCorridor ? 0 : game.player.x;
    const tz = inCorridor ? -OFFICE.halfDepth + 2 : game.player.z;
    const dx = tx - e.x;
    const dz = tz - e.z;
    const distance = dhypot(dx, dz);
    const toPlayer = dhypot(game.player.x - e.x, game.player.z - e.z);
    // Face the player (yaw 0 looks toward -z, the same convention as the player).
    e.yaw = datan2(-(game.player.x - e.x), -(game.player.z - e.z));
    if (inCorridor || toPlayer > ENEMY.attackRange) {
      // Walk toward the target; a hit staggers it for a few frames. Walls and desks still block.
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
  // Endless squads: when the last bot drops, the next one starts filing through the door after a beat.
  if (!game.enemies.some((e) => e.alive)) {
    if (game.spawnTimer === 0) game.spawnTimer = ENEMY.waveDelay;
    else if (--game.spawnTimer === 0) {
      game.wave += 1;
      game.enemies.forEach((e, i) => {
        const fresh = squadEnemy(i);
        e.x = fresh.x;
        e.z = fresh.z;
        e.yaw = fresh.yaw;
        e.health = fresh.health;
        e.hitFrames = 0;
        e.cooldown = 0;
        e.alive = true;
      });
    }
  }
}
