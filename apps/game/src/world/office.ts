// The office layout: static boxes, data only. Rendering reads every box; collision reads the solid ones.
import { DOOR, OFFICE } from "../config";

// A monitor's lit face: a flat quad the renderer textures, facing +z.
export interface Screen {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

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
const LEG: [number, number, number] = [0.42, 0.32, 0.22];
const MONITOR: [number, number, number] = [0.08, 0.09, 0.1];
const KEYS: [number, number, number] = [0.16, 0.17, 0.19];
const CORRIDOR_WALL: [number, number, number] = [0.3, 0.31, 0.35];
const CORRIDOR_FLOOR: [number, number, number] = [0.2, 0.21, 0.25];
const EXIT_SIGN: [number, number, number] = [0.2, 0.9, 0.35];

// Each desk's monitor faces +z. The screen quad sits just in front of the bezel; SCREENS (below) gives its
// center and size so the renderer can texture it.
const MONITOR_Y = 1.06;
const MONITOR_Z = -0.2;
const BEZEL_D = 0.05;

function desk(x: number, z: number): Box[] {
  return [
    // A table now: a thin top (the same solid footprint, so collision does not change) on four legs.
    { x, y: 0.72, z, w: 1.6, h: 0.06, d: 0.8, color: DESK, solid: true },
    ...[-0.72, 0.72].flatMap((lx) =>
      [-0.32, 0.32].map((lz): Box => ({
        x: x + lx,
        y: 0.345,
        z: z + lz,
        w: 0.08,
        h: 0.69,
        d: 0.08,
        color: LEG,
        solid: false,
      })),
    ),
    // The monitor: bezel, stand neck and foot, plus a keyboard. All decoration (never solid).
    {
      x,
      y: MONITOR_Y,
      z: z + MONITOR_Z,
      w: 0.62,
      h: 0.42,
      d: BEZEL_D,
      color: MONITOR,
      solid: false,
    },
    { x, y: 0.8, z: z + MONITOR_Z, w: 0.06, h: 0.1, d: 0.06, color: MONITOR, solid: false },
    {
      x,
      y: 0.765,
      z: z + MONITOR_Z + 0.05,
      w: 0.3,
      h: 0.03,
      d: 0.22,
      color: MONITOR,
      solid: false,
    },
    { x, y: 0.765, z: z + 0.12, w: 0.5, h: 0.03, d: 0.17, color: KEYS, solid: false },
  ];
}

function screen(x: number, z: number): Screen {
  // A hair in front of the bezel face so it never z-fights.
  return { x, y: MONITOR_Y, z: z + MONITOR_Z + BEZEL_D / 2 + 0.001, w: 0.54, h: 0.33 };
}

const DESKS: [number, number][] = [
  [-4, -6],
  [4, -6],
  [-4, 0],
  [4, 0],
  [-4, 5],
  [4, 5],
];

const { halfWidth: hw, halfDepth: hd, wallHeight: wh, wallThickness: t } = OFFICE;

// The service door is a 2 m gap in the -z wall; behind it a narrow corridor where the bot squads queue.
const doorX = DOOR.halfWidth; // 1
const doorTop = wh - 0.8; // lintel bottom at 2.2 m
const corridorZ = -hd - DOOR.corridorDepth / 2;
const corridorW = 2 * (doorX + t);
const corridorEnd = -hd - DOOR.corridorDepth - t / 2;
// The players' entrances are the same gap + lintel with a shallow alcove instead of the bot corridor.
const pd = DOOR.playerDepth;
const p1Z = hd + pd / 2; // port 0: door in the +z wall
const p1End = hd + pd + t / 2;
const p2X = -hw - pd / 2; // port 1: door in the -x wall
const p2End = -hw - pd - t / 2;

export const OFFICE_BOXES: Box[] = [
  { x: 0, y: -0.05, z: 0, w: hw * 2, h: 0.1, d: hd * 2, color: FLOOR, solid: false },
  { x: 0, y: wh + 0.05, z: 0, w: hw * 2, h: 0.1, d: hd * 2, color: WALL, solid: false },
  // Back wall split around the door gap, plus a lintel above it.
  { x: -(doorX + hw) / 2, y: wh / 2, z: -hd, w: hw - doorX, h: wh, d: t, color: WALL, solid: true },
  { x: (doorX + hw) / 2, y: wh / 2, z: -hd, w: hw - doorX, h: wh, d: t, color: WALL, solid: true },
  // The lintel is visual only: collision is 2D, so a solid lintel would seal the doorway.
  {
    x: 0,
    y: (doorTop + wh) / 2,
    z: -hd,
    w: corridorW,
    h: wh - doorTop,
    d: t,
    color: WALL,
    solid: false,
  },
  // A little exit sign over the door, on the room side.
  { x: 0, y: doorTop - 0.25, z: -hd + t, w: 0.7, h: 0.28, d: 0.06, color: EXIT_SIGN, solid: false },
  // The +z wall, split around port 0's door; its alcove behind.
  { x: -(doorX + hw) / 2, y: wh / 2, z: hd, w: hw - doorX, h: wh, d: t, color: WALL, solid: true },
  { x: (doorX + hw) / 2, y: wh / 2, z: hd, w: hw - doorX, h: wh, d: t, color: WALL, solid: true },
  {
    x: 0,
    y: (doorTop + wh) / 2,
    z: hd,
    w: corridorW,
    h: wh - doorTop,
    d: t,
    color: WALL,
    solid: false,
  },
  { x: 0, y: doorTop - 0.25, z: hd - t, w: 0.7, h: 0.28, d: 0.06, color: EXIT_SIGN, solid: false },
  { x: 0, y: -0.05, z: p1Z, w: corridorW, h: 0.1, d: pd, color: CORRIDOR_FLOOR, solid: false },
  { x: -(doorX + t / 2), y: wh / 2, z: p1Z, w: t, h: wh, d: pd, color: CORRIDOR_WALL, solid: true },
  { x: doorX + t / 2, y: wh / 2, z: p1Z, w: t, h: wh, d: pd, color: CORRIDOR_WALL, solid: true },
  { x: 0, y: wh / 2, z: p1End, w: corridorW, h: wh, d: t, color: CORRIDOR_WALL, solid: true },
  // The -x wall, split around port 1's door; its alcove behind.
  { x: -hw, y: wh / 2, z: -(doorX + hd) / 2, w: t, h: wh, d: hd - doorX, color: WALL, solid: true },
  { x: -hw, y: wh / 2, z: (doorX + hd) / 2, w: t, h: wh, d: hd - doorX, color: WALL, solid: true },
  {
    x: -hw,
    y: (doorTop + wh) / 2,
    z: 0,
    w: t,
    h: wh - doorTop,
    d: corridorW,
    color: WALL,
    solid: false,
  },
  { x: -hw + t, y: doorTop - 0.25, z: 0, w: 0.06, h: 0.28, d: 0.7, color: EXIT_SIGN, solid: false },
  { x: p2X, y: -0.05, z: 0, w: pd, h: 0.1, d: corridorW, color: CORRIDOR_FLOOR, solid: false },
  { x: p2X, y: wh / 2, z: -(doorX + t / 2), w: pd, h: wh, d: t, color: CORRIDOR_WALL, solid: true },
  { x: p2X, y: wh / 2, z: doorX + t / 2, w: pd, h: wh, d: t, color: CORRIDOR_WALL, solid: true },
  { x: p2End, y: wh / 2, z: 0, w: t, h: wh, d: corridorW, color: CORRIDOR_WALL, solid: true },
  { x: hw, y: wh / 2, z: 0, w: t, h: wh, d: hd * 2, color: WALL, solid: true },
  // Corridor behind the door: floor, both side walls, and the end wall.
  {
    x: 0,
    y: -0.05,
    z: corridorZ,
    w: corridorW,
    h: 0.1,
    d: DOOR.corridorDepth,
    color: CORRIDOR_FLOOR,
    solid: false,
  },
  {
    x: -(doorX + t / 2),
    y: wh / 2,
    z: corridorZ,
    w: t,
    h: wh,
    d: DOOR.corridorDepth,
    color: CORRIDOR_WALL,
    solid: true,
  },
  {
    x: doorX + t / 2,
    y: wh / 2,
    z: corridorZ,
    w: t,
    h: wh,
    d: DOOR.corridorDepth,
    color: CORRIDOR_WALL,
    solid: true,
  },
  { x: 0, y: wh / 2, z: corridorEnd, w: corridorW, h: wh, d: t, color: CORRIDOR_WALL, solid: true },
  ...DESKS.flatMap(([x, z]) => desk(x, z)),
];

// The monitors' screens, textured by the renderer (one per desk).
export const SCREENS: Screen[] = DESKS.map(([x, z]) => screen(x, z));

// A smaller badge quad on the back of each monitor, facing -z.
export const LOGOS: Screen[] = DESKS.map(([x, z]) => ({
  x,
  y: MONITOR_Y,
  z: z + MONITOR_Z - BEZEL_D / 2 - 0.001,
  w: 0.22,
  h: 0.22,
}));

// Ceiling lamps, for the renderer.
export const LAMPS: [number, number, number][] = [
  [-4, wh - 0.2, -5],
  [4, wh - 0.2, -5],
  [-4, wh - 0.2, 4],
  [4, wh - 0.2, 4],
];
