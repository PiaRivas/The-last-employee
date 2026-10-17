import type { Platform } from "dotframe/src/platform";
import { publishProbe } from "dotframe/src/probe-web";
import { loadBytes, run } from "dotframe/src/web/run";
import { createSfx, loadSfx } from "./src/audio/sfx";
import { WINDOW } from "./src/game";
import { createSetup } from "./src/setup";
import { createFonts, loadFonts } from "./src/ui/fonts";

// ?mash=<seed> lets a scripted player press random inputs.
const mash = new URLSearchParams(location.search).get("mash");

// fit: "window" fills the browser window; pointerLock captures the mouse on click for first-person look.
const sfx = createSfx();
const fonts = createFonts();
// Losing pointer lock (Esc) or window focus pauses the game: the setup loop reads this once per frame.
let lost = false;
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === null) lost = true;
});
window.addEventListener("blur", () => {
  lost = true;
});
const setup = createSetup({
  mash: mash === null ? null : Number(mash),
  onProbe: publishProbe,
  sfx,
  fonts,
  lockLost: (): boolean => {
    const was = lost;
    lost = false;
    return was;
  },
});
await run(
  WINDOW,
  (platform: Platform) => {
    void loadSfx(sfx, platform.audio, loadBytes);
    void loadFonts(fonts, platform.gpu, loadBytes);
    return setup(platform);
  },
  { fit: "window", pointerLock: true },
);
