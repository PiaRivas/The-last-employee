// Every gameplay number lives here, so tuning never means hunting through systems.
// Units: meters, radians, and frames (the sim steps at a fixed 60 Hz, see STEP).

export const WINDOW = { width: 960, height: 540, title: "THE LAST EMPLOYEE" };

// One fixed simulation step, in seconds. Speeds below are per frame.
export const STEP = 1 / 60;

export const PLAYER = {
  // Spawn point and initial view (yaw 0 looks toward -z).
  spawn: { x: 0, z: 6, yaw: 0 },
  // Eye height above the floor.
  eyeHeight: 1.6,
  // Collision radius of the player cylinder (used by world collision).
  radius: 0.35,
  // Walk speed, meters per frame.
  walkSpeed: 4.5 * STEP,
  // Pitch limit, so the view never flips over.
  maxPitch: 1.45,
  maxHealth: 100,
};

export const LOOK = {
  // Radians per unit of encoded look. The input carries a signed 8-bit yaw and pitch per frame.
  step: 0.0025,
  // Radians per CSS pixel of mouse movement (presentation side, in setup.ts).
  sensitivity: 0.0025,
};

export const OFFICE = {
  // Half sizes of the room: x from -halfWidth to halfWidth, z from -halfDepth to halfDepth.
  halfWidth: 8,
  halfDepth: 10,
  wallHeight: 3,
  wallThickness: 0.2,
};

export const ENEMY = {
  maxHealth: 100,
  // Half the robot's width, for punch reach.
  radius: 0.6,
  // Frames a robot flashes after a hit.
  hitFrames: 12,
  // Where the first robot stands for VS 0.1.
  spawn: { x: 0, z: -4 },
};

export const COMBAT = {
  // Reach of a punch, meters from the eye.
  reach: 1.4,
  damage: 25,
  // Frames a punch takes from start to ready again.
  punchFrames: 18,
  // Frames from the click to the moment the fist lands (the fist is furthest out at punchFrames / 2).
  impactFrame: 9,
  // Cosine of the widest angle off the view a robot can be hit at (about 45 degrees).
  aimCos: 0.7,
};
