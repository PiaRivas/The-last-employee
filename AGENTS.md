# AGENTS.md

Instructions for coding agents working on THE LAST EMPLOYEE. Humans: see README.md and CONTRIBUTING.md.

## What this is

Browser FPS action comedy (Three.js + TypeScript + Vite + Rapier 3D). Monorepo with npm workspaces; the game is `apps/game`. Concept: `docs/CONCEPT.md`. Current scope and acceptance criteria: `docs/ROADMAP.md`. Build only what the current roadmap entry asks for, and leave anything listed as out of scope alone.

## Commands (run from the repo root)

- `npm install`: install all workspaces
- `npm run dev`: dev server at http://localhost:5173 (extra args go to Vite: `npm run dev -- --port 4000`)
- `npm run typecheck`: TypeScript only
- `npm run build`: typecheck and production build. **It must pass before you report work as done.**
- `npm run format`: Prettier

## Hard constraints

- Stack is fixed: Three.js, TypeScript strict, Vite, `@dimforge/rapier3d-compat`. Ask before adding any other runtime dependency.
- No backend, no auth, no external APIs, no commercial assets. Use procedural geometry or CC0 assets, and credit them in `CREDITS.md`.
- No UI frameworks: HUD and menus are DOM and CSS.
- Frame-rate independent: scale all motion by delta time and clamp large deltas.
- Performance first: low-poly, shared geometries and materials, few lights, dispose what you remove.

## Architecture conventions

- Keep `apps/game/src/main.ts` a thin bootstrap. Each system gets its own folder (`core/`, `physics/`, `world/`, `player/`, `enemy/`, `combat/`, `ui/`).
- All gameplay tuning lives in one config module.
- Rapier must be initialised (`await RAPIER.init()`) before any physics call.
- Expose read-only game state on `window.__TEST__.state()` so Playwright playtests can assert on it. Pointer Lock can't be granted headless, so support a `?test=1` mode that simulates the lock.

## Verify before claiming done

1. `npm run build` passes.
2. Run the game (`npm run dev`), drive it with Playwright, check the console for errors, and look at a screenshot.
3. Walk through the acceptance criteria in `docs/ROADMAP.md` and say which ones you verified and how.

## Git

Conventional Commits (`feat(scope): …`). Branch from `main` and open a PR. Never force-push `main`.
