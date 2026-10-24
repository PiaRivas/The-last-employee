// One player's input for one frame, packed into a single number (what the sim, replays and netplay carry).
// Bits 0-8 are buttons; bits 9-16 and 17-24 are the yaw and pitch turn as signed 8-bit counts of LOOK.step radians;
// bit 25 is the restart button; bit 26 is the platform's "lost mouse capture/focus" signal (pauses, never confirms).
import { LOOK } from "./config";

export const Button = {
  Forward: 1 << 0,
  Back: 1 << 1,
  Left: 1 << 2,
  Right: 1 << 3,
  Jump: 1 << 4,
  Dodge: 1 << 5,
  PunchLeft: 1 << 6,
  PunchRight: 1 << 7,
  Pause: 1 << 8,
  Restart: 1 << 25,
  Unlock: 1 << 26,
};

const YAW_SHIFT = 9;
const PITCH_SHIFT = 17;
// Button bits: the low nine plus Restart and Unlock.
const BUTTON_MASK = 0x1ff | Button.Restart | Button.Unlock;
// Largest look count per frame in either direction.
export const LOOK_MAX = 127;

export interface FrameInput {
  buttons: number;
  // Turn this frame, radians. Positive yaw turns left, positive pitch looks up.
  yaw: number;
  pitch: number;
}

export function toCount(radians: number): number {
  return Math.max(-LOOK_MAX, Math.min(LOOK_MAX, Math.round(radians / LOOK.step)));
}

function fromByte(byte: number): number {
  return byte >= 128 ? byte - 256 : byte;
}

export function pack(buttons: number, yawCount: number, pitchCount: number): number {
  return (
    (buttons & BUTTON_MASK) |
    ((yawCount & 0xff) << YAW_SHIFT) |
    ((pitchCount & 0xff) << PITCH_SHIFT)
  );
}

export function unpack(bits: number): FrameInput {
  return {
    buttons: bits & BUTTON_MASK,
    yaw: fromByte((bits >> YAW_SHIFT) & 0xff) * LOOK.step,
    pitch: fromByte((bits >> PITCH_SHIFT) & 0xff) * LOOK.step,
  };
}

// JSON input for --inputs and replays: {"forward": true, "punchLeft": true, "yaw": 0.05}. yaw and pitch in radians.
export function encode(input: unknown): number {
  const i = input as {
    forward?: boolean;
    back?: boolean;
    left?: boolean;
    right?: boolean;
    jump?: boolean;
    dodge?: boolean;
    punchLeft?: boolean;
    punchRight?: boolean;
    pause?: boolean;
    restart?: boolean;
    yaw?: number;
    pitch?: number;
  };
  const buttons =
    (i.forward ? Button.Forward : 0) |
    (i.back ? Button.Back : 0) |
    (i.left ? Button.Left : 0) |
    (i.right ? Button.Right : 0) |
    (i.jump ? Button.Jump : 0) |
    (i.dodge ? Button.Dodge : 0) |
    (i.punchLeft ? Button.PunchLeft : 0) |
    (i.punchRight ? Button.PunchRight : 0) |
    (i.pause ? Button.Pause : 0) |
    (i.restart ? Button.Restart : 0);
  return pack(buttons, toCount(i.yaw ?? 0), toCount(i.pitch ?? 0));
}

// Mashing for sim and snap: any buttons but pause, and small turns.
export function randomInput(next: () => number): number {
  const buttons = Math.floor(next() * 256);
  const yaw = Math.floor(next() * 41) - 20;
  const pitch = Math.floor(next() * 21) - 10;
  return pack(buttons, yaw, pitch);
}
