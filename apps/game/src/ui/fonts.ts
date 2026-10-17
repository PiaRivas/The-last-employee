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
// before that, so early frames simply show no text.
export function register(fonts: Fonts, draw: Draw2D): boolean {
  if (!fonts.atlas) return false;
  draw.addFont([FAMILY, "sans-serif"], fonts.atlas, fonts.metrics);
  return true;
}

// Bytes to text without TextDecoder, which scriptc does not have (the metrics file is ASCII).
export function decodeText(bytes: Uint8Array): string {
  let text = "";
  for (const b of bytes) text += String.fromCharCode(b);
  return text;
}

export async function loadFonts(
  fonts: Fonts,
  gpu: Gpu,
  load: (path: string) => Promise<Uint8Array>,
): Promise<void> {
  try {
    fonts.atlas = await gpu.createImage(await load(PNG), true, true);
    fonts.metrics = decodeText(await load(METRICS));
  } catch (error) {
    // A missing font never stops the game; text just does not draw.
    console.warn("fonts:", error);
  }
}
