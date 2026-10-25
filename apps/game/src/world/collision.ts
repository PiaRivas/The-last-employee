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
  let minX = -maxX;
  let hiX = maxX;
  let minZ = -maxZ;
  let hiZ = maxZ;
  // Doorways let an axis past the room wall while the point is inside the gap's width:
  // the bot corridor (-z), port 0's alcove (+z) and port 1's alcove (-x). The corridor
  // walls themselves bound the other axis.
  const slack = DOOR.halfWidth + OFFICE.wallThickness;
  if (Math.abs(x) <= slack) {
    minZ = -(OFFICE.halfDepth + DOOR.corridorDepth - radius);
    hiZ = OFFICE.halfDepth + DOOR.playerDepth - radius;
  }
  if (Math.abs(z) <= slack) minX = -(OFFICE.halfWidth + DOOR.playerDepth - radius);
  return { x: Math.max(minX, Math.min(hiX, x)), z: Math.max(minZ, Math.min(hiZ, z)) };
}
