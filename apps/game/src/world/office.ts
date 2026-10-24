// The office layout: static boxes, data only. Rendering reads every box; collision reads the solid ones.
import { OFFICE } from "../config";

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

function desk(x: number, z: number): Box[] {
  return [
    { x, y: 0.375, z, w: 1.6, h: 0.75, d: 0.8, color: DESK, solid: true },
    { x, y: 1.0, z: z - 0.2, w: 0.6, h: 0.4, d: 0.05, color: MONITOR, solid: false },
  ];
}

const { halfWidth: hw, halfDepth: hd, wallHeight: wh, wallThickness: t } = OFFICE;

export const OFFICE_BOXES: Box[] = [
  { x: 0, y: -0.05, z: 0, w: hw * 2, h: 0.1, d: hd * 2, color: FLOOR, solid: false },
  { x: 0, y: wh + 0.05, z: 0, w: hw * 2, h: 0.1, d: hd * 2, color: WALL, solid: false },
  { x: 0, y: wh / 2, z: -hd, w: hw * 2, h: wh, d: t, color: WALL, solid: true },
  { x: 0, y: wh / 2, z: hd, w: hw * 2, h: wh, d: t, color: WALL, solid: true },
  { x: -hw, y: wh / 2, z: 0, w: t, h: wh, d: hd * 2, color: WALL, solid: true },
  { x: hw, y: wh / 2, z: 0, w: t, h: wh, d: hd * 2, color: WALL, solid: true },
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
