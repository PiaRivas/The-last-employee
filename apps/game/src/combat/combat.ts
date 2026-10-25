// Punches: left and right click start a punch on each fist, and a landing fist hurts robots and the rival.
import { dcos, dhypot, dsin } from "dotframe/src/detmath";
import { COMBAT, ENEMY, PLAYER } from "../config";
import { Button } from "../input";
import type { Game, Player } from "../state";
import { resolve } from "../world/collision";

// pressed: buttons of this player that went down this frame.
export function stepCombat(game: Game, p: Player, pressed: number): void {
  if (p.punchLeft > 0) p.punchLeft -= 1;
  if (p.punchRight > 0) p.punchRight -= 1;
  if (p.health <= 0) return;
  if (pressed & Button.PunchLeft && p.punchLeft === 0) p.punchLeft = COMBAT.punchFrames;
  if (pressed & Button.PunchRight && p.punchRight === 0) p.punchRight = COMBAT.punchFrames;
  const landing = COMBAT.punchFrames - COMBAT.impactFrame;
  if (p.punchLeft === landing) land(game, p);
  if (p.punchRight === landing) land(game, p);
}

// A fist lands: the nearest robot or rival player within reach and roughly in front takes the hit.
function land(game: Game, p: Player): void {
  const fx = -dsin(p.yaw);
  const fz = -dcos(p.yaw);
  let enemy: number | null = null;
  let rival: Player | null = null;
  let nearestEnemy = COMBAT.reach + ENEMY.radius;
  let nearestRival = COMBAT.reach + PLAYER.radius;
  const aimed = (tx: number, tz: number, nearest: number): boolean => {
    const dx = tx - p.x;
    const dz = tz - p.z;
    const distance = dhypot(dx, dz);
    if (distance > nearest || distance === 0) return false;
    return (dx * fx + dz * fz) / distance >= COMBAT.aimCos;
  };
  game.enemies.forEach((e, i: number): void => {
    if (!e.alive) return;
    const distance = dhypot(e.x - p.x, e.z - p.z);
    if (!aimed(e.x, e.z, nearestEnemy)) return;
    nearestEnemy = distance;
    enemy = i;
  });
  for (const q of game.players) {
    if (q === p || !q.active || q.health <= 0) continue;
    const distance = dhypot(q.x - p.x, q.z - p.z);
    if (!aimed(q.x, q.z, nearestRival)) continue;
    nearestRival = distance;
    rival = q;
  }
  // The closest of both kinds takes the hit.
  const hitPlayer = rival !== null && (enemy === null || nearestRival <= nearestEnemy);
  const tx = hitPlayer ? (rival?.x ?? 0) : enemy === null ? 0 : game.enemies[enemy].x;
  const tz = hitPlayer ? (rival?.z ?? 0) : enemy === null ? 0 : game.enemies[enemy].z;
  if (!hitPlayer && enemy === null) return;
  const dx = tx - p.x;
  const dz = tz - p.z;
  const distance = dhypot(dx, dz) || 1;
  if (hitPlayer && rival !== null) {
    rival.health -= COMBAT.playerDamage;
    rival.hurtFrames = PLAYER.hurtFrames;
    const moved = resolve(
      rival.x + (dx / distance) * ENEMY.knockback,
      rival.z + (dz / distance) * ENEMY.knockback,
      PLAYER.radius,
    );
    rival.x = moved.x;
    rival.z = moved.z;
    return;
  }
  const e = game.enemies[enemy ?? 0];
  if (!e) return;
  e.health -= COMBAT.damage;
  e.hitFrames = ENEMY.hitFrames;
  // Knockback: shoved away from the player, not through walls (enemies reuse the same collision resolve).
  const moved = resolve(
    e.x + (dx / distance) * ENEMY.knockback,
    e.z + (dz / distance) * ENEMY.knockback,
    ENEMY.radius,
  );
  e.x = moved.x;
  e.z = moved.z;
}
