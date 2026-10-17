// Punches: left and right click start a punch on each fist.
import { dcos, dhypot, dsin } from "dotframe/src/detmath";
import { COMBAT, ENEMY } from "../config";
import { Button } from "../input";
import type { Game } from "../state";

// pressed: buttons that went down this frame.
export function stepCombat(game: Game, pressed: number): void {
  const f = game.fists;
  if (f.left > 0) f.left -= 1;
  if (f.right > 0) f.right -= 1;
  if (pressed & Button.PunchLeft && f.left === 0) f.left = COMBAT.punchFrames;
  if (pressed & Button.PunchRight && f.right === 0) f.right = COMBAT.punchFrames;
  const landing = COMBAT.punchFrames - COMBAT.impactFrame;
  if (f.left === landing) land(game);
  if (f.right === landing) land(game);
}

// A fist lands: the nearest robot within reach and roughly in front takes the hit.
function land(game: Game): void {
  const p = game.player;
  const fx = -dsin(p.yaw);
  const fz = -dcos(p.yaw);
  let target = -1;
  let nearest = COMBAT.reach + ENEMY.radius;
  game.enemies.forEach((e, i: number): void => {
    if (!e.alive) return;
    const dx = e.x - p.x;
    const dz = e.z - p.z;
    const distance = dhypot(dx, dz);
    if (distance > nearest || distance === 0) return;
    if ((dx * fx + dz * fz) / distance < COMBAT.aimCos) return;
    nearest = distance;
    target = i;
  });
  const e = game.enemies[target];
  if (!e) return;
  e.health -= COMBAT.damage;
  e.hitFrames = ENEMY.hitFrames;
}
