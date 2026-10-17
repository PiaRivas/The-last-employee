// Shared by main.web.ts, main.native.ts and main.ios.ts: keyboard and mouse to one packed input per frame, fixed
// 60 Hz steps, one render per frame.
import { createDraw2D } from "dotframe/src/draw2d";
import type { AudioPlayer } from "dotframe/src/audio";
import type { Frame, RenderGpu } from "dotframe/src/gpu";
import type { Input } from "dotframe/src/input";
import { Key, MouseButton } from "dotframe/src/input";
import { createMasher, createProbe, type ProbeState } from "dotframe/src/probe";
import { createRenderer } from "dotframe/src/render";
import { LOOK, STEP } from "./config";
import { createGame, type Game, randomInput, render, step, WINDOW } from "./game";
import { Button, pack, toCount } from "./input";
import { createScene } from "./render/scene";

export interface SetupOptions {
  // A seed makes the player a scripted masher (tests); null reads the keyboard and mouse.
  mash: number | null;
  // Called after each step with the probe state: the web publishes it as globalThis.__dotframe, native builds write
  // it to a file. Required, not optional: scriptc cannot represent an optional function.
  onProbe: (state: ProbeState) => void;
}

// What setup needs from a platform: the async web and native platforms and iOS's library platform all have it.
export interface SetupPlatform {
  gpu: RenderGpu;
  input: Input;
  audio: AudioPlayer;
}

function buttons(input: Input): number {
  const pointer = input.pointer();
  return (
    (input.down(Key.W) ? Button.Forward : 0) |
    (input.down(Key.S) ? Button.Back : 0) |
    (input.down(Key.A) ? Button.Left : 0) |
    (input.down(Key.D) ? Button.Right : 0) |
    (input.down(Key.Space) ? Button.Jump : 0) |
    (input.down(Key.ShiftLeft) ? Button.Dodge : 0) |
    ((pointer.buttons & MouseButton.Left) !== 0 ? Button.PunchLeft : 0) |
    ((pointer.buttons & MouseButton.Right) !== 0 ? Button.PunchRight : 0) |
    (input.down(Key.Escape) ? Button.Pause : 0)
  );
}

export function createSetup(options: SetupOptions): (platform: SetupPlatform) => Frame {
  return ({ gpu, input }: SetupPlatform): Frame => {
    // The logical canvas keeps the game's aspect and grows to fill the screen.
    let aspect = 0;
    let offsetX = 0;
    let offsetY = 0;
    const draw = createDraw2D(gpu, WINDOW.width, WINDOW.height);
    const fit = (): void => {
      const now = gpu.aspect();
      if (now === aspect) return;
      aspect = now;
      const logicalWidth = Math.max(WINDOW.width, Math.round(WINDOW.height * aspect));
      const logicalHeight = Math.max(WINDOW.height, Math.round(WINDOW.width / aspect));
      offsetX = (logicalWidth - WINDOW.width) / 2;
      offsetY = (logicalHeight - WINDOW.height) / 2;
      draw.resize(logicalWidth, logicalHeight);
    };
    const game: Game = createGame(Math.floor(Math.random() * 1e9));
    const scene = createScene(createRenderer(gpu), game);
    const mash = options.mash === null ? null : createMasher(options.mash, randomInput);
    const probe = createProbe();
    let frame = 0;
    let simulated = -1;
    // Mouse turn not yet sent, in radians: the input carries whole LOOK.step counts, the rest waits for next frame.
    let yaw = 0;
    let pitch = 0;
    return (time: number): boolean => {
      if (simulated < 0) simulated = time;
      // Mouse right turns right (negative yaw), mouse down looks down (negative pitch).
      const look = input.look();
      yaw -= look.x * LOOK.sensitivity;
      pitch -= look.y * LOOK.sensitivity;
      for (let n = 0; simulated + STEP <= time && n < 5; n++) {
        const yawCount = toCount(yaw);
        const pitchCount = toCount(pitch);
        yaw -= yawCount * LOOK.step;
        pitch -= pitchCount * LOOK.step;
        const bits = mash ? mash() : pack(buttons(input), yawCount, pitchCount);
        step(game, [bits]);
        frame += 1;
        probe.update(null, "local", frame);
        options.onProbe(probe.state);
        simulated += STEP;
      }
      fit();
      draw.begin();
      draw.translate(offsetX, offsetY);
      render(game, draw, scene);
      draw.resetTransform();
      draw.end({ r: 0.08, g: 0.08, b: 0.1 });
      return true;
    };
  };
}
