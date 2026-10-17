// dotframe-allow-math-file: presentation only, never simulation state.
// The 3D scene: built once, then posed from the game state every frame. Presentation only: nothing here writes Game.
import type { World } from "dotframe/src/ecs";
import { createWorld, spawn } from "dotframe/src/ecs";
import type { Draw } from "dotframe/src/gpu";
import { type Vec3, vec3 } from "dotframe/src/math";
import type { Camera, Environment, Renderer } from "dotframe/src/render";
import { box } from "dotframe/src/shapes";
import { COMBAT, PLAYER } from "../config";
import type { Game } from "../state";
import { LAMPS, OFFICE_BOXES } from "../world/office";

export interface Scene {
  renderer: Renderer;
  world: World;
  environment: Environment;
  // Entities posed each frame.
  robots: number[][];
  fists: { left: number; right: number };
  // Each entity's own size, so a hidden mesh (scale 0) can come back.
  sizes: Map<number, Vec3>;
}

// The robot, after the pixel mascot: a wide ribbed body, stubby arms, four little legs,
// a skull on top and two red eyes. Meters, in the robot's own frame: x to its right,
// y up from the floor, -z out of its face.
const ROBOT_HIT = vec3(1, 0.86, 0.78);
const ROBOT_EYE = vec3(1, 0.06, 0.04);
// Body paint per spawn index: the office mascot orange, then bone-white skeletons and gunmetal.
const ROBOT_SKINS = [vec3(0.87, 0.47, 0.35), vec3(0.85, 0.82, 0.74), vec3(0.45, 0.47, 0.52)];
interface Part {
  at: [number, number, number];
  size: [number, number, number];
  eye: boolean;
}
const LEG_TOP = 0.3;
const BODY_Y = LEG_TOP + 0.4;
const HEAD_Y = BODY_Y + 0.55;
const ROBOT_PARTS: Part[] = [
  { at: [0, BODY_Y, 0], size: [1.2, 0.8, 0.7], eye: false },
  // Ribs: thin bars across the chest, so the skeletons read as skeletons.
  ...[-0.15, 0, 0.15].map((dy): Part => ({
    at: [0, BODY_Y + dy, -0.36],
    size: [0.9, 0.06, 0.03],
    eye: false,
  })),
  { at: [-0.7, BODY_Y - 0.1, 0], size: [0.2, 0.2, 0.3], eye: false },
  { at: [0.7, BODY_Y - 0.1, 0], size: [0.2, 0.2, 0.3], eye: false },
  ...[-0.45, -0.25, 0.25, 0.45].map((x): Part => ({
    at: [x, LEG_TOP / 2, 0],
    size: [0.1, LEG_TOP, 0.12],
    eye: false,
  })),
  // Skull: a smaller block above the body; the eyes moved up onto it.
  { at: [0, HEAD_Y, -0.05], size: [0.42, 0.34, 0.38], eye: false },
  { at: [-0.11, HEAD_Y + 0.04, -0.26], size: [0.08, 0.1, 0.04], eye: true },
  { at: [0.11, HEAD_Y + 0.04, -0.26], size: [0.08, 0.1, 0.04], eye: true },
];

const FIST = vec3(0.86, 0.67, 0.53);

function add(
  world: World,
  sizes: Map<number, Vec3>,
  mesh: number,
  color: Vec3,
  position: Vec3,
  scale: Vec3,
): number {
  const entity = spawn(world);
  world.transforms.set(entity, { position, rotation: vec3(0, 0, 0), scale });
  world.meshes.set(entity, { mesh, color });
  sizes.set(entity, scale);
  return entity;
}

export function createScene(renderer: Renderer, game: Game): Scene {
  const world = createWorld();
  const sizes = new Map<number, Vec3>();
  const cube = renderer.addMesh(box());
  for (const b of OFFICE_BOXES)
    add(
      world,
      sizes,
      cube,
      vec3(b.color[0], b.color[1], b.color[2]),
      vec3(b.x, b.y, b.z),
      vec3(b.w, b.h, b.d),
    );
  const robots = game.enemies.map((_, i: number) =>
    ROBOT_PARTS.map((part): number => {
      const entity = add(
        world,
        sizes,
        cube,
        part.eye ? ROBOT_EYE : (ROBOT_SKINS[i % ROBOT_SKINS.length] ?? ROBOT_SKINS[0]),
        vec3(0, 0, 0),
        vec3(part.size[0], part.size[1], part.size[2]),
      );
      const mesh = world.meshes.get(entity);
      // The eyes glow; the body keeps its mascot orange even in shadow.
      if (mesh) mesh.emissive = part.eye ? 2 : 0.35;
      return entity;
    }),
  );
  const fists = {
    left: add(world, sizes, cube, FIST, vec3(0, 0, 0), vec3(0.09, 0.09, 0.16)),
    right: add(world, sizes, cube, FIST, vec3(0, 0, 0), vec3(0.09, 0.09, 0.16)),
  };
  const environment: Environment = {
    ambient: vec3(0.35, 0.36, 0.4),
    sun: { direction: vec3(0.3, 1, 0.2), color: vec3(0.55, 0.55, 0.5) },
    lights: LAMPS.map(([x, y, z]) => ({
      position: vec3(x, y, z),
      color: vec3(1, 0.95, 0.85),
      range: 9,
    })),
  };
  return { renderer, world, environment, robots, fists, sizes };
}

function place(
  scene: Scene,
  entity: number,
  position: Vec3,
  yaw: number,
  pitch: number,
  visible: boolean,
): void {
  const t = scene.world.transforms.get(entity);
  if (!t) return;
  t.position = position;
  t.rotation = vec3(pitch, yaw, 0);
  // Scaled to zero is how a mesh hides (the renderer culls it).
  t.scale = visible ? (scene.sizes.get(entity) ?? t.scale) : vec3(0, 0, 0);
}

export function camera(game: Game): Camera {
  const p = game.player;
  const eye = vec3(p.x, p.y + PLAYER.eyeHeight, p.z);
  const cp = Math.cos(p.pitch);
  return {
    eye,
    target: vec3(
      eye.x - Math.sin(p.yaw) * cp,
      eye.y + Math.sin(p.pitch),
      eye.z - Math.cos(p.yaw) * cp,
    ),
    fovY: 1.2,
    near: 0.05,
    far: 60,
  };
}

// The scene's draws for this frame, to queue under the HUD.
export function sceneDraws(scene: Scene, game: Game): Draw[] {
  const { world } = scene;
  game.enemies.forEach((e, i: number): void => {
    const parts = scene.robots[i];
    if (!parts) return;
    // Rotation about y by yaw: local (x, z) to world.
    const c = Math.cos(e.yaw);
    const sn = Math.sin(e.yaw);
    // A hit flashes the body and squashes the robot for a moment.
    const squash = e.hitFrames > 0 ? 0.9 : 1;
    ROBOT_PARTS.forEach((part, j: number): void => {
      const entity = parts[j];
      if (entity === undefined) return;
      const mesh = world.meshes.get(entity);
      if (mesh && !part.eye)
        mesh.color =
          e.hitFrames > 0 ? ROBOT_HIT : (ROBOT_SKINS[i % ROBOT_SKINS.length] ?? ROBOT_SKINS[0]);
      const [lx, ly, lz] = part.at;
      place(
        scene,
        entity,
        vec3(e.x + c * lx + sn * lz, ly * squash, e.z - sn * lx + c * lz),
        e.yaw,
        0,
        e.alive,
      );
    });
  });

  // Fists in front of the eye, pushed forward while punching.
  // TODO(VS 0.1, combate): a real punch curve (wind-up, hit, recover) instead of this triangle.
  const cam = camera(game);
  const p = game.player;
  const fwd = vec3(cam.target.x - cam.eye.x, cam.target.y - cam.eye.y, cam.target.z - cam.eye.z);
  const right = vec3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
  const fist = (entity: number, frames: number, sideSign: number): void => {
    const t = frames / COMBAT.punchFrames;
    const reach = 0.6 + (t > 0.5 ? 1 - t : t) * 2 * 0.45;
    const at = vec3(
      cam.eye.x + fwd.x * reach + right.x * 0.2 * sideSign,
      cam.eye.y + fwd.y * reach - 0.2,
      cam.eye.z + fwd.z * reach + right.z * 0.2 * sideSign,
    );
    place(scene, entity, at, p.yaw, p.pitch, true);
  };
  fist(scene.fists.left, game.fists.left, -1);
  fist(scene.fists.right, game.fists.right, 1);

  return scene.renderer.draws(world, cam, scene.environment);
}
