import type { Platform } from "dotframe/src/platform";
import { publishProbe } from "dotframe/src/probe-web";
import { connectRelay } from "dotframe/src/relay-client";
import { loadBytes, run } from "dotframe/src/web/run";
import { createSfx, loadSfx } from "./src/audio/sfx";
import { WINDOW } from "./src/game";
import { createScreens, loadScreens } from "./src/render/screens";
import { createSetup } from "./src/setup";
import { createFonts, loadFonts } from "./src/ui/fonts";

// ?mash=<seed> lets a scripted player press random inputs.
// ?room=<name>&relay=<ws://host:port> plays a networked duel through a `dotframe relay serve` relay.
const params = new URLSearchParams(location.search);
const mash = params.get("mash");
const room = params.get("room");
const relay = params.get("relay") ?? "ws://localhost:8787";
const link = room === null ? null : connectRelay(relay, room);
// Online peers must start from the same seed or their sims diverge: derive it from the room name (djb2).
const hashRoom = (s: string): number => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
};
const seed =
  room === null ? Math.floor(Math.random() * 1e9) : hashRoom(room);

// fit: "window" fills the browser window; pointerLock captures the mouse on click for first-person look.
const sfx = createSfx();
const fonts = createFonts();
const screens = createScreens();
// Losing pointer lock (Esc) or window focus pauses the game: the setup loop reads this once per frame.
let lost = false;
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === null) lost = true;
});
window.addEventListener("blur", () => {
  lost = true;
});
// The dev watcher rebuilds dist and can 404 a load mid-flight: keep retrying until fonts, sfx and the
// screen image land, so a session that opened during a rebuild does not stay silent and dark forever.
let loading = false;
const keepLoading = (platform: Platform): void => {
  if (loading || (fonts.atlas !== null && sfx.swing >= 0 && screens.texture !== null)) return;
  loading = true;
  void (async (): Promise<void> => {
    if (sfx.swing < 0) await loadSfx(sfx, platform.audio, loadBytes);
    if (fonts.atlas === null) await loadFonts(fonts, platform.gpu, loadBytes);
    if (screens.texture === null) await loadScreens(screens, platform.gpu, loadBytes);
  })().then(() => {
    loading = false;
    if (fonts.atlas === null || sfx.swing < 0 || screens.texture === null)
      setTimeout(() => keepLoading(platform), 250);
  });
};
const setup = createSetup({
  mash: mash === null ? null : Number(mash),
  onProbe: publishProbe,
  sfx,
  fonts,
  screens,
  lockLost: (): boolean => {
    const was = lost;
    lost = false;
    return was;
  },
  duel: link !== null,
  net:
    link === null
      ? null
      : { port: link.slot, status: link.status, transport: link.transport },
  seed,
});
await run(
  WINDOW,
  (platform: Platform) => {
    keepLoading(platform);
    return setup(platform);
  },
  { fit: "window", pointerLock: true },
);
