// Player against the office. Deterministic and inside step(): no physics library (see docs/ROADMAP.md, Decisiones
// abiertas).
import { OFFICE } from "../config";

// Where a player cylinder of this radius ends up when it tries to stand at (x, z).
// TODO(VS 0.1, mundo): push out of the solid boxes in OFFICE_BOXES (cylinder vs axis-aligned box). For now it only
// keeps the player inside the room.
export function resolve(x: number, z: number, radius: number): { x: number; z: number } {
  const maxX = OFFICE.halfWidth - OFFICE.wallThickness / 2 - radius;
  const maxZ = OFFICE.halfDepth - OFFICE.wallThickness / 2 - radius;
  return { x: Math.max(-maxX, Math.min(maxX, x)), z: Math.max(-maxZ, Math.min(maxZ, z)) };
}
