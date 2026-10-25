// Generates the two-player JSONL inputs that `dotframe replay record --inputs` replays.
// bun scripts/gen-inputs.ts
import { writeFileSync } from "node:fs";
import { Button, pack, toCount } from "../src/input";
import { createGame, step } from "../src/game";
import type { Game } from "../src/state";

const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

// Steers port 0 at (tx, tz); punches while close. Returns the inputs it fed the sim.
function run(targets: { x: number; z: number }[], maxFrames: number): number[][] {
  const game: Game = createGame(1, true);
  const inputs: number[][] = [];
  let target = 0;
  let punches = 0;
  for (let f = 0; f < maxFrames && game.phase !== 3; f++) {
    const p = game.players[0];
    let bits = 0;
    if (game.phase === 0) {
      bits = f % 2 === 0 ? pack(Button.PunchRight, 0, 0) : 0;
    } else {
      const t = targets[Math.min(target, targets.length - 1)];
      const dx = t.x - p.x;
      const dz = t.z - p.z;
      const dist = Math.hypot(dx, dz);
      const want = Math.atan2(-dx, -dz);
      const turn = wrap(want - p.yaw);
      const last = target === targets.length - 1;
      if (!last && dist < 0.25) target += 1;
      // Face first, then walk; alternate fists (each has its own cooldown) once in reach of the final target.
      const fists =
        (last && dist < 1.6 && p.punchLeft === 0 ? Button.PunchLeft : 0) |
        (last && dist < 1.6 && p.punchRight === 0 ? Button.PunchRight : 0);
      const buttons =
        (Math.abs(turn) < 0.35 && dist >= (last ? 1.1 : 0.25) ? Button.Forward : 0) | fists;
      bits = pack(buttons, toCount(turn), 0);
    }
    inputs.push([bits, 0]);
    step(game, inputs[inputs.length - 1]);
    if (game.players[1].health <= 0) punches += 1;
  }
  console.log(
    "frames:",
    inputs.length,
    "phase:",
    game.phase,
    "winner:",
    game.winner,
    "p2hp:",
    game.players[1].health,
  );
  return inputs;
}

// P0 walks out its door, turns left, walks on: the same path look-walk used to cover.
const walk = run(
  [
    { x: 0, z: 2 },
    { x: -5, z: 2 },
    { x: -5, z: -5 },
  ],
  420,
);
writeFileSync(
  "replays/inputs/look-walk.jsonl",
  walk.map((i) => JSON.stringify(i)).join("\n") + "\n",
);

// P0 crosses the office to port 1's door and punches it out: covers PvP damage, winner and game over.
const ko = run(
  [
    { x: -4, z: 2.5 },
    { x: -7.5, z: 0.5 },
    { x: -8.6, z: 0 },
  ],
  3600,
);
writeFileSync("replays/inputs/pvp-ko.jsonl", ko.map((i) => JSON.stringify(i)).join("\n") + "\n");
