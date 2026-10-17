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
  robots: { body: number; head: number; tie: number }[];
  fists: { left: number; right: number };
  // Each entity's own size, so a hidden mesh (scale 0) can come back.
  sizes: Map<number, Vec3>;
}

const ROBOT = vec3(0.6, 0.62, 0.68);
const ROBOT_HIT = vec3(1, 0.35, 0.3);
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
  const robots = game.enemies.map(() => ({
    body: add(world, sizes, cube, ROBOT, vec3(0, 0, 0), vec3(0.7, 1.1, 0.45)),
    head: add(world, sizes, cube, ROBOT, vec3(0, 0, 0), vec3(0.45, 0.4, 0.4)),
    tie: add(world, sizes, cube, vec3(0.75, 0.1, 0.12), vec3(0, 0, 0), vec3(0.12, 0.5, 0.02)),
  }));
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
    const r = scene.robots[i];
    if (!r) return;
    const color = e.hitFrames > 0 ? ROBOT_HIT : ROBOT;
    for (const entity of [r.body, r.head]) {
      const mesh = world.meshes.get(entity);
      if (mesh) mesh.color = color;
    }
    place(scene, r.body, vec3(e.x, 0.95, e.z), e.yaw, 0, e.alive);
    place(scene, r.head, vec3(e.x, 1.75, e.z), e.yaw, 0, e.alive);
    // The tie hangs on the front (-z when yaw is 0).
    place(
      scene,
      r.tie,
      vec3(e.x - Math.sin(e.yaw) * 0.24, 1.05, e.z - Math.cos(e.yaw) * 0.24),
      e.yaw,
      0,
      e.alive,
    );
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
