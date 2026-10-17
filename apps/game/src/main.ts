// Stack smoke test: proves Three.js + Rapier (WASM) + Vite + TypeScript boot together.
// A box falls onto a floor under Rapier gravity. Replace with the real game bootstrap
// when Vertical Slice 0.1 starts (see docs/ROADMAP.md).

import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

const MAX_DELTA = 1 / 20; // clamp long frames so physics never explodes

async function boot(): Promise<void> {
  await RAPIER.init();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1f2b);
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 100);
  camera.position.set(4, 3, 6);
  camera.lookAt(0, 0.5, 0);

  scene.add(new THREE.HemisphereLight(0xdde8ff, 0x30343c, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 8, 3);
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.2, 10),
    new THREE.MeshLambertMaterial({ color: 0x3b4252 }),
  );
  floor.position.y = -0.1;
  scene.add(floor);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xe0533d }),
  );
  scene.add(box);

  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.createCollider(RAPIER.ColliderDesc.cuboid(5, 0.1, 5).setTranslation(0, -0.1, 0));
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 4, 0).setAngvel({ x: 1, y: 0.5, z: 0.3 }),
  );
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setRestitution(0.3), body);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Read-only hook for automated playtests (Playwright): window.__TEST__.state()
  (window as unknown as { __TEST__: unknown }).__TEST__ = {
    state: () => ({ ready: true, boxY: body.translation().y }),
  };

  const status = document.getElementById("status");
  if (status) status.textContent = "THE LAST EMPLOYEE — stack OK (Three.js + Rapier + Vite + TS)";

  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - last) / 1000, MAX_DELTA);
    last = now;
    world.timestep = dt;
    world.step();
    const p = body.translation();
    const r = body.rotation();
    box.position.set(p.x, p.y, p.z);
    box.quaternion.set(r.x, r.y, r.z, r.w);
    renderer.render(scene, camera);
  });
}

boot().catch((err: unknown) => {
  console.error(err);
  const status = document.getElementById("status");
  if (status) status.textContent = "Error al iniciar — revisa la consola";
});
