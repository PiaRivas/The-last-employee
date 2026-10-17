// dotframe-allow-math-file: presentation only, never simulation state.
// The HUD font: Bangers, an SDF atlas that ships with dotframe (dotframe/assets/fonts), copied into assets/fonts.
// Like the sfx holder: filled in by the entry point once the bytes load, registered on the Draw2D by setup.
import type { Draw2D } from "dotframe/src/draw2d";
import type { Gpu, Texture } from "dotframe/src/gpu";

export const FAMILY = "Bangers";
const PNG = "assets/fonts/bangers.png";
const METRICS = "assets/fonts/bangers.json";

export interface Fonts {
  atlas: Texture | null;
  metrics: string;
}

export function createFonts(): Fonts {
  return { atlas: null, metrics: "" };
}

// Registers the font on a Draw2D once it is loaded. Called every frame until it sticks; fillText draws nothing
// before that, so early frames simply show no text. Never throws: a half-failed load must not kill the loop.
export function register(fonts: Fonts, draw: Draw2D): boolean {
  if (!fonts.atlas || !fonts.metrics) return false;
  try {
    draw.addFont([FAMILY, "sans-serif"], fonts.atlas, fonts.metrics);
  } catch (error) {
    // A bad atlas is permanent, not transient: report "ready" so the loop stops retrying; text stays invisible.
    console.warn("fonts:", error);
  }
  return true;
}

// Bytes to text without TextDecoder, which scriptc does not have (the metrics file is ASCII).
export function decodeText(bytes: Uint8Array): string {
  let text = "";
  for (const b of bytes) text += String.fromCharCode(b);
  return text;
}

// Loads atlas and metrics, then publishes them together: a partial load (one fetch 404s, e.g. while dev rebuilds
// wipe dist) leaves fonts empty instead of handing register() an atlas with no metrics.
export async function loadFonts(
  fonts: Fonts,
  gpu: Gpu,
  load: (path: string) => Promise<Uint8Array>,
): Promise<void> {
  try {
    const atlas = await gpu.createImage(await load(PNG), true, true);
    const metrics = decodeText(await load(METRICS));
    JSON.parse(metrics); // addFont parses it later; reject a bad file here instead of inside the frame loop
    fonts.metrics = metrics;
    fonts.atlas = atlas;
  } catch (error) {
    // A missing font never stops the game; text just does not draw.
    console.warn("fonts:", error);
  }
}
