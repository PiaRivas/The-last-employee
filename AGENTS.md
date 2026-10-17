# AGENTS.md

Instructions for coding agents working on THE LAST EMPLOYEE. Humans: see README.md and CONTRIBUTING.md.

## What this is

Browser-first FPS action comedy built on **dotframe** (TypeScript engine with an agent-first CLI, deterministic fixed-step sim, WebGPU renderer). It's a Bun workspaces monorepo and the game lives in `apps/game`. Concept: `docs/CONCEPT.md`. Current scope and acceptance criteria: `docs/ROADMAP.md`. Build only what the current roadmap entry asks for.

**Before touching the game, run `dotframe skills get core`.** For 3D, first person and pointer lock, the "3D games" section of that skill is the reference. Engine-specific guidance for this app: `apps/game/AGENTS.md`.

## Commands (repo root)

- `bun install`
- `bun run sim`: headless 600-frame mash, JSON state and checksum
- `bun run snap`: render frame 300 to `apps/game/.dotframe/snap-300.png`. Open it and look.
- `bun run test`: golden replays (`apps/game/replays/*.json`)
- `bun run typecheck` / `bun run build` / `bun run doctor`
- `bun run dev`: serve the web build with rebuild on change

Run other dotframe commands from `apps/game` (that's where `dotframe.json` lives) and pass `--json`.

## Hard constraints

- The stack is dotframe on Bun. Ask before adding any runtime dependency. Physics or render libraries that break determinism, save/restore, or native builds (WASM, DOM-bound) are out.
- Respect the Sim contract: state changes only in `step`, `render` only reads, use seeded RNG, and use `dotframe/src/detmath` in sim code. `dotframe doctor` must keep `sim:render` and `sim:math` OK.
- No backend, auth, external APIs or commercial assets.
- Performance first: low-poly, few lights. Check with `dotframe perf`.

## Verify before claiming done

1. `bun run typecheck && bun run test && bun run build` pass.
2. `bun run sim` state matches the intent. Snap the relevant frames and look at the PNGs.
3. Walk the acceptance criteria in `docs/ROADMAP.md` and say which you verified and how.
4. Record a replay for every new mechanic. If gameplay changed on purpose, re-record and say so.

## Trust ladder

`deploy`, `relay deploy` and `device install` are external: run `--dry-run`, show the plan, and wait for a human. Never add `--yes` yourself.

## Git

Conventional Commits (`feat(scope): …`). Branch from `main` and open a PR. Never force-push `main`.
