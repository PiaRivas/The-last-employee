// Player against the office. Deterministic and inside step(): no physics library (see docs/ROADMAP.md, Decisiones
// abiertas).
import { DOOR, OFFICE } from "../config";
import { OFFICE_BOXES } from "./office";

// Where a player cylinder of this radius ends up when it tries to stand at (x, z): pushed out of every solid box
// (walls and desks) along the axis of least penetration, then clamped inside the room.
export function resolve(x: number, z: number, radius: number): { x: number; z: number } {
  // Two passes settle a corner push created by an earlier push.
  for (let pass = 0; pass < 2; pass++) {
    for (const b of OFFICE_BOXES) {
      if (!b.solid) continue;
      const hx = b.w / 2 + radius;
      const hz = b.d / 2 + radius;
      const dx = x - b.x;
      const dz = z - b.z;
      if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue;
      const px = hx - Math.abs(dx);
      const pz = hz - Math.abs(dz);
      if (px < pz) x = b.x + (dx < 0 ? -hx : hx);
      else z = b.z + (dz < 0 ? -hz : hz);
    }
  }
  const maxX = OFFICE.halfWidth - OFFICE.wallThickness / 2 - radius;
  const maxZ = OFFICE.halfDepth - OFFICE.wallThickness / 2 - radius;
  // The room clamp lets the door corridor through: inside its width, z may pass the back wall.
  const minZ =
    Math.abs(x) <= DOOR.halfWidth + OFFICE.wallThickness
      ? -(OFFICE.halfDepth + DOOR.corridorDepth - radius)
      : -maxZ;
  return { x: Math.max(-maxX, Math.min(maxX, x)), z: Math.max(minZ, Math.min(maxZ, z)) };
}
