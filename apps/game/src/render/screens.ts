// dotframe-allow-math-file: presentation only, never simulation state.
// The monitors' lit screens: a textured quad per desk. Like the sfx/fonts holders, the texture arrives
// asynchronously after the scene exists; apply() puts it on the quads once it lands.
import type { MeshData } from "dotframe/src/gltf";
import type { Gpu, Texture } from "dotframe/src/gpu";
import { vec3 } from "dotframe/src/math";
import type { Scene } from "./scene";

const PNG = "assets/screens/code.png";
const LOGO = "assets/screens/anthropic.png";

export interface Screens {
  texture: Texture | null;
  logo: Texture | null;
}

export function createScreens(): Screens {
  return { texture: null, logo: null };
}

// A missing image never stops the game; screens just stay dark. Each asset loads on its own so one
// 404 does not take the other down.
export async function loadScreens(
  screens: Screens,
  gpu: Gpu,
  load: (path: string) => Promise<Uint8Array>,
): Promise<void> {
  if (screens.texture === null)
    try {
      screens.texture = await gpu.createImage(await load(PNG), true, true);
    } catch (error) {
      console.warn("screens:", error);
    }
  if (screens.logo === null)
    try {
      screens.logo = await gpu.createImage(await load(LOGO), true, true);
    } catch (error) {
      console.warn("screens:", error);
    }
}

// A 1x1 quad in the XY plane (z = 0) facing +z, with UVs covering the whole texture. The back faces are
// duplicated flipped (as loadGlb does for doubleSided) so winding never hides it from behind a desk.
export function screenMesh(): MeshData {
  // Corners: top-left, top-right, bottom-right, bottom-left; v = 0 is the image's top edge.
  const positions = new Float32Array([
    -0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0,
    -0.5, -0.5, 0,
  ]);
  const normals = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  ]);
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1]);
  const indices = new Uint32Array([0, 3, 2, 0, 2, 1, 4, 6, 7, 4, 5, 6]);
  return { positions, normals, indices, uvs };
}

// Called from the frame loop once the texture is in: screens go from a dark "off" panel to the image,
// emissive so it reads as a lit display even in shadow.
export function applyScreens(scene: Scene, texture: Texture): void {
  for (const entity of scene.screens) {
    const mesh = scene.world.meshes.get(entity);
    if (!mesh) continue;
    mesh.texture = texture;
    mesh.color = vec3(1, 1, 1);
    mesh.emissive = 0.8;
  }
}

// Same for the logo badges on the monitor backs; alphaCutoff drops the PNG's transparent background
// so the badge floats on the dark bezel.
export function applyLogos(scene: Scene, texture: Texture): void {
  for (const entity of scene.logos) {
    const mesh = scene.world.meshes.get(entity);
    if (!mesh) continue;
    mesh.texture = texture;
    mesh.color = vec3(1, 1, 1);
    mesh.emissive = 0.8;
    mesh.alphaCutoff = 0.5;
  }
}
