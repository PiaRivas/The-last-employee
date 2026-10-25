// Every gameplay number lives here, so tuning never means hunting through systems.
// Units: meters, radians, and frames (the sim steps at a fixed 60 Hz, see STEP).

export const WINDOW = { width: 960, height: 540, title: "THE LAST EMPLOYEE" };

// One fixed simulation step, in seconds. Speeds below are per frame.
export const STEP = 1 / 60;

export const PLAYER = {
  // One spawn per port, just inside each player's own door (yaw 0 looks toward -z).
  // Port 0 enters through the +z wall, port 1 through the -x wall facing +x.
  spawns: [
    { x: 0, z: 8.6, yaw: 0 },
    { x: -8.6, z: 0, yaw: -Math.PI / 2 },
  ],
  // Eye height above the floor.
  eyeHeight: 1.6,
  // Collision radius of the player cylinder (used by world collision).
  radius: 0.35,
  // Walk speed, meters per frame.
  walkSpeed: 4.5 * STEP,
  // Jump: upward speed and gravity, meters per frame and per frame squared.
  jumpSpeed: 3.6 * STEP,
  gravity: 9.8 * STEP * STEP,
  // Dodge: duration in frames and speed multiplier while it lasts.
  dodgeFrames: 14,
  dodgeBoost: 2.6,
  // Pitch limit, so the view never flips over.
  maxPitch: 1.45,
  maxHealth: 100,
  // Frames the damage vignette shows after taking a hit.
  hurtFrames: 14,
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

// The service door in the middle of the -z wall and the corridor behind it, where the bots queue.
export const DOOR = {
  // Half the gap's width: x from -1 to 1 stays open.
  halfWidth: 1.0,
  // Meters the corridor extends past the back wall (z goes down to -halfDepth - depth).
  corridorDepth: 6,
  // The players' own entrances: port 0 comes in through the +z wall, port 1 through the -x wall.
  // Short alcoves, 2 m deep, with the same gap and lintel as the service door.
  playerDepth: 2,
};

export const ENEMY = {
  maxHealth: 100,
  // Half the robot's width, for punch reach.
  radius: 0.6,
  // Frames a robot flashes after a hit.
  hitFrames: 12,
  // Bots per squad filing through the door; the next squad follows waveDelay frames after the last one drops.
  waveSize: 5,
  waveDelay: 90,
  // Queue inside the corridor: x at the door, the first bot at spawnZ and each next spawnGap meters behind.
  spawnZ: -11,
  spawnGap: 1.0,
  // Walk speed toward the player, meters per frame.
  speed: 1.1 * STEP,
  // Meters at which it stops and swings.
  attackRange: 1.1,
  // Damage per swing and the frames between swings.
  attackDamage: 10,
  attackCooldown: 55,
  // Meters a punch knocks the robot back.
  knockback: 0.45,
};

export const COMBAT = {
  // Reach of a punch, meters from the eye.
  reach: 1.4,
  damage: 25,
  // A punch on the rival employee: half a robot's swing (ENEMY.attackDamage / 2).
  playerDamage: 5,
  // Frames a punch takes from start to ready again.
  punchFrames: 18,
  // Frames from the click to the moment the fist lands (the fist is furthest out at punchFrames / 2).
  impactFrame: 9,
  // Cosine of the widest angle off the view a robot can be hit at (about 45 degrees).
  aimCos: 0.7,
};
