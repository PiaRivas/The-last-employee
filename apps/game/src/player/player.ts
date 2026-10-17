// First-person movement and look.
import { dcos, dsin, wrapAngle } from "dotframe/src/detmath";
import { PLAYER } from "../config";
import { Button, type FrameInput } from "../input";
import type { Game } from "../state";
import { resolve } from "../world/collision";

export function stepPlayer(game: Game, input: FrameInput): void {
  const p = game.player;
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
  const moved = resolve(p.x + dx * PLAYER.walkSpeed, p.z + dz * PLAYER.walkSpeed, PLAYER.radius);
  p.x = moved.x;
  p.z = moved.z;

  // TODO(VS 0.1, jugador): jump (Button.Jump, p.vy, p.onGround) and dodge (Button.Dodge, p.dodgeFrames).
}
