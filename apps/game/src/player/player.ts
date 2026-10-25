// First-person movement and look.
import { dcos, dhypot, dsin, wrapAngle } from "dotframe/src/detmath";
import { ENEMY, PLAYER } from "../config";
import { Button, type FrameInput } from "../input";
import type { Game, Player } from "../state";
import { resolve } from "../world/collision";

export function stepPlayer(game: Game, p: Player, input: FrameInput): void {
  if (p.health <= 0) return;
  p.yaw = wrapAngle(p.yaw + input.yaw);
  p.pitch = Math.max(-PLAYER.maxPitch, Math.min(PLAYER.maxPitch, p.pitch + input.pitch));

  // Ground axes for this yaw: forward (-sin, -cos) and right (cos, -sin).
  const s = dsin(p.yaw);
  const c = dcos(p.yaw);
  const b = input.buttons;
  const ahead = (b & Button.Forward ? 1 : 0) - (b & Button.Back ? 1 : 0);
  const side = (b & Button.Right ? 1 : 0) - (b & Button.Left ? 1 : 0);
  let dx = -s * ahead + c * side;
  let dz = -c * ahead - s * side;
  if (ahead !== 0 && side !== 0) {
    // Diagonals are not faster.
    dx *= Math.SQRT1_2;
    dz *= Math.SQRT1_2;
  }
  // Dodge: a short dash in the current move direction, or forward when standing still.
  if (b & Button.Dodge && p.dodgeFrames === 0 && p.onGround) {
    p.dodgeFrames = PLAYER.dodgeFrames;
    if (ahead === 0 && side === 0) {
      dx = -s;
      dz = -c;
    }
  }
  const speed = PLAYER.walkSpeed * (p.dodgeFrames > 0 ? PLAYER.dodgeBoost : 1);
  if (p.dodgeFrames > 0) p.dodgeFrames -= 1;
  const moved = resolve(p.x + dx * speed, p.z + dz * speed, PLAYER.radius);
  p.x = moved.x;
  p.z = moved.z;
  // Robots are obstacles too: never stand inside one (a punch at distance 0 cannot land).
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const ex = p.x - e.x;
    const ez = p.z - e.z;
    const min = PLAYER.radius + ENEMY.radius;
    const d = dhypot(ex, ez);
    if (d > 0 && d < min) {
      p.x = e.x + (ex / d) * min;
      p.z = e.z + (ez / d) * min;
    }
  }
  // Same for the other player.
  for (const q of game.players) {
    if (q === p || !q.active || q.health <= 0) continue;
    const qx = p.x - q.x;
    const qz = p.z - q.z;
    const min = PLAYER.radius * 2;
    const d = dhypot(qx, qz);
    if (d > 0 && d < min) {
      p.x = q.x + (qx / d) * min;
      p.z = q.z + (qz / d) * min;
    }
  }

  // Jump and gravity: the floor is y = 0.
  if (p.onGround && b & Button.Jump) {
    p.vy = PLAYER.jumpSpeed;
    p.onGround = false;
  }
  if (!p.onGround) {
    p.vy -= PLAYER.gravity;
    p.y += p.vy;
    if (p.y <= 0) {
      p.y = 0;
      p.vy = 0;
      p.onGround = true;
    }
  }
  if (p.hurtFrames > 0) p.hurtFrames -= 1;
}
