// The office layout: static boxes, data only. Rendering reads every box; collision reads the solid ones.
import { DOOR, OFFICE } from "../config";

export interface Box {
  // Center and full size, meters. y is the box's center height.
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: [number, number, number];
  // Blocks the player (walls, desks); false for decoration such as monitors and the ceiling.
  solid: boolean;
}

const WALL: [number, number, number] = [0.78, 0.76, 0.7];
const FLOOR: [number, number, number] = [0.32, 0.34, 0.38];
const DESK: [number, number, number] = [0.55, 0.42, 0.3];
const MONITOR: [number, number, number] = [0.08, 0.09, 0.1];
const CORRIDOR_WALL: [number, number, number] = [0.3, 0.31, 0.35];
const CORRIDOR_FLOOR: [number, number, number] = [0.2, 0.21, 0.25];
const EXIT_SIGN: [number, number, number] = [0.2, 0.9, 0.35];

function desk(x: number, z: number): Box[] {
  return [
    { x, y: 0.375, z, w: 1.6, h: 0.75, d: 0.8, color: DESK, solid: true },
    { x, y: 1.0, z: z - 0.2, w: 0.6, h: 0.4, d: 0.05, color: MONITOR, solid: false },
  ];
}

const { halfWidth: hw, halfDepth: hd, wallHeight: wh, wallThickness: t } = OFFICE;

// The service door is a 2 m gap in the -z wall; behind it a narrow corridor where the bot squads queue.
const doorX = DOOR.halfWidth; // 1
const doorTop = wh - 0.8; // lintel bottom at 2.2 m
const corridorZ = -hd - DOOR.corridorDepth / 2;
const corridorW = 2 * (doorX + t);
const corridorEnd = -hd - DOOR.corridorDepth - t / 2;

export const OFFICE_BOXES: Box[] = [
  { x: 0, y: -0.05, z: 0, w: hw * 2, h: 0.1, d: hd * 2, color: FLOOR, solid: false },
  { x: 0, y: wh + 0.05, z: 0, w: hw * 2, h: 0.1, d: hd * 2, color: WALL, solid: false },
  // Back wall split around the door gap, plus a lintel above it.
  { x: -(doorX + hw) / 2, y: wh / 2, z: -hd, w: hw - doorX, h: wh, d: t, color: WALL, solid: true },
  { x: (doorX + hw) / 2, y: wh / 2, z: -hd, w: hw - doorX, h: wh, d: t, color: WALL, solid: true },
  // The lintel is visual only: collision is 2D, so a solid lintel would seal the doorway.
  { x: 0, y: (doorTop + wh) / 2, z: -hd, w: corridorW, h: wh - doorTop, d: t, color: WALL, solid: false },
  // A little exit sign over the door, on the room side.
  { x: 0, y: doorTop - 0.25, z: -hd + t, w: 0.7, h: 0.28, d: 0.06, color: EXIT_SIGN, solid: false },
  { x: 0, y: wh / 2, z: hd, w: hw * 2, h: wh, d: t, color: WALL, solid: true },
  { x: -hw, y: wh / 2, z: 0, w: t, h: wh, d: hd * 2, color: WALL, solid: true },
  { x: hw, y: wh / 2, z: 0, w: t, h: wh, d: hd * 2, color: WALL, solid: true },
  // Corridor behind the door: floor, both side walls, and the end wall.
  { x: 0, y: -0.05, z: corridorZ, w: corridorW, h: 0.1, d: DOOR.corridorDepth, color: CORRIDOR_FLOOR, solid: false },
  { x: -(doorX + t / 2), y: wh / 2, z: corridorZ, w: t, h: wh, d: DOOR.corridorDepth, color: CORRIDOR_WALL, solid: true },
  { x: doorX + t / 2, y: wh / 2, z: corridorZ, w: t, h: wh, d: DOOR.corridorDepth, color: CORRIDOR_WALL, solid: true },
  { x: 0, y: wh / 2, z: corridorEnd, w: corridorW, h: wh, d: t, color: CORRIDOR_WALL, solid: true },
  ...desk(-4, -6),
  ...desk(4, -6),
  ...desk(-4, 0),
  ...desk(4, 0),
  ...desk(-4, 5),
  ...desk(4, 5),
];

// Ceiling lamps, for the renderer.
export const LAMPS: [number, number, number][] = [
  [-4, wh - 0.2, -5],
  [4, wh - 0.2, -5],
  [-4, wh - 0.2, 4],
  [4, wh - 0.2, 4],
];
