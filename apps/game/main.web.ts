import { publishProbe } from "dotframe/src/probe-web";
import { run } from "dotframe/src/web/run";
import { WINDOW } from "./src/game";
import { createSetup } from "./src/setup";

// ?mash=<seed> lets a scripted player press random inputs.
const mash = new URLSearchParams(location.search).get("mash");

// fit: "window" fills the browser window; pointerLock captures the mouse on click for first-person look.
await run(
  WINDOW,
  createSetup({ mash: mash === null ? null : Number(mash), onProbe: publishProbe }),
  { fit: "window", pointerLock: true },
);
