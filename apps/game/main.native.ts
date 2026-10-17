// Native entry for dotframe build macos|windows. The CLI stages it with the engine and compiles it with scriptc.
// DOTFRAME_MASH scripts the player, and DOTFRAME_PROBE is where the CLI reads this build's checksums.
import { writeFileSync } from "node:fs";
import type { Frame } from "dotframe/src/gpu";
import { run } from "dotframe/src/native/run";
import type { Platform } from "dotframe/src/platform";
import type { ProbeState } from "dotframe/src/probe";
import { WINDOW } from "./src/game";
import { createSetup } from "./src/setup";

const mash = process.env.DOTFRAME_MASH ?? "";
const probeFile = process.env.DOTFRAME_PROBE ?? "";
let written = -1;

const setup = createSetup({
  mash: mash === "" ? null : Number(mash),
  onProbe: (state: ProbeState): void => {
    // Every 30 frames is enough for the CLI.
    if (probeFile === "" || state.frame - written < 30) return;
    written = state.frame;
    writeFileSync(probeFile, JSON.stringify(state));
  },
});

// run() takes (platform: Platform) => Frame. Pass a function of exactly that type: scriptc cannot convert a function
// value whose parameter type differs (setup takes the narrower SetupPlatform), though it can pass a wider argument.
await run(WINDOW, (platform: Platform): Frame => setup(platform));
