// The robot: walks at the nearest living employee through the door, swings when close, flashes when hit.
import { datan2, dhypot } from "dotframe/src/detmath";
import { ENEMY, OFFICE, PLAYER } from "../config";
import { type Game, type Player, squadEnemy } from "../state";
import { resolve } from "../world/collision";

// Inside the corridor the players are out of reach anyway: bots aim at the door first, then at a player.
const DOOR_MOUTH_Z = -(OFFICE.halfDepth - OFFICE.wallThickness / 2);

function nearest(game: Game, x: number, z: number): Player | null {
  let best: Player | null = null;
  let bestD = Infinity;
  for (const p of game.players) {
    if (!p.active || p.health <= 0) continue;
    const d = dhypot(p.x - x, p.z - z);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

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
    const prey = nearest(game, e.x, e.z);
    const inCorridor = e.z < DOOR_MOUTH_Z;
    const tx = inCorridor ? 0 : (prey?.x ?? 0);
    const tz = inCorridor ? -OFFICE.halfDepth + 2 : (prey?.z ?? 0);
    const dx = tx - e.x;
    const dz = tz - e.z;
    const distance = dhypot(dx, dz);
    // Face the prey (yaw 0 looks toward -z, the same convention as the players).
    if (prey) e.yaw = datan2(-(prey.x - e.x), -(prey.z - e.z));
    if (inCorridor || !prey || dhypot(prey.x - e.x, prey.z - e.z) > ENEMY.attackRange) {
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
      // Separate stacked robots so the squad does not merge into one blob.
      for (const o of game.enemies) {
        if (o === e || !o.alive) continue;
        const sx = e.x - o.x;
        const sz = e.z - o.z;
        const d = dhypot(sx, sz);
        const min = ENEMY.radius * 2;
        if (d > 0 && d < min) {
          e.x += (sx / d) * (min - d) * 0.5;
          e.z += (sz / d) * (min - d) * 0.5;
        }
      }
    } else if (e.cooldown === 0 && prey.health > 0) {
      e.cooldown = ENEMY.attackCooldown;
      prey.health -= ENEMY.attackDamage;
      prey.hurtFrames = PLAYER.hurtFrames;
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
