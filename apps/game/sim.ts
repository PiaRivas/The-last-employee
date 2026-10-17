// The dotframe CLI contract: dotframe sim, snap, replay, and desync drive the game through this module.
import { datan2 } from "dotframe/src/detmath";
import { createRenderer } from "dotframe/src/render";
import { defineSim, type SimPlatform, type SimRun } from "dotframe/src/sim";
import { LOOK, PLAYER } from "./src/config";
import {
  checksum,
  createGame,
  encode,
  type Game,
  PLAYERS,
  randomInput,
  render,
  restore,
  snapshot,
  state,
  step,
  WINDOW,
} from "./src/game";
import { Button, LOOK_MAX, pack, toCount } from "./src/input";
import { createScene } from "./src/render/scene";
import { Phase } from "./src/state";
import { decodeText, FAMILY } from "./src/ui/fonts";

const NAMED: Record<string, number> = {
  jump: Button.Jump,
  dodge: Button.Dodge,
  punchLeft: Button.PunchLeft,
  punchRight: Button.PunchRight,
};

export default defineSim({
  players: PLAYERS,
  window: WINDOW,
  clear: { r: 0.08, g: 0.08, b: 0.1 },
  options: {},
  neutral: 0,
  rollbackWindow: 20,
  encode,
  random: randomInput,
  // For replay record --plan: yaw 0 looks toward -z and positive yaw turns left.
  pilot: {
    yawTo: (dx: number, dz: number): number => datan2(-dx, -dz),
    turn: LOOK_MAX * LOOK.step,
    input: (move): number => {
      let buttons = (move.forward ? Button.Forward : 0) | (move.use ? Button.PunchRight : 0);
      for (const name of move.buttons) buttons |= NAMED[name] ?? 0;
      return pack(buttons, toCount(move.yaw), toCount(move.pitch));
    },
  },
  create: (platform: SimPlatform): SimRun => {
    let game: Game = createGame(1);
    // The 3D scene also builds on the headless stub GPU, so doctor's purity check runs the real render path.
    const scene = createScene(createRenderer(platform.gpu), game);
    // snap draws through platform.draw: the HUD font registers there. Headless runs skip it.
    let ready = Promise.resolve();
    if (platform.draw && platform.image) {
      const draw = platform.draw;
      const image = platform.image;
      ready = (async (): Promise<void> => {
        const atlas = await image(await platform.load("assets/fonts/bangers.png"), true, true);
        draw.addFont(
          [FAMILY, "sans-serif"],
          atlas,
          decodeText(await platform.load("assets/fonts/bangers.json")),
        );
      })();
    }
    return {
      ready,
      start: (seed: number): void => {
        game = createGame(seed);
      },
      step: (inputs: number[]): void => step(game, inputs),
      checksum: (): number => checksum(game),
      state: (): unknown => state(game),
      over: (): boolean => game.phase === Phase.Over,
      save: (): unknown => snapshot(game),
      restore: (saved: unknown): void => restore(game, saved as Game),
      inspect: (): unknown => game,
      render: (draw) => render(game, draw, scene),
      pose: () => ({
        x: game.player.x,
        y: game.player.y + PLAYER.eyeHeight,
        z: game.player.z,
        yaw: game.player.yaw,
        pitch: game.player.pitch,
      }),
    };
  },
});
