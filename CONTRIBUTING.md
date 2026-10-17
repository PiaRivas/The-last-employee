# Contribuir

## Flujo

1. Crea una rama desde `main`: `feat/<algo>`, `fix/<algo>` o `chore/<algo>`.
2. Commits con [Conventional Commits](https://www.conventionalcommits.org/): `feat(player): add dodge`, `fix(combat): punches hit through desks`.
3. Antes de abrir el PR: `bun run typecheck && bun run test && bun run build && bun run format:check`.
4. Abre el PR contra `main`. El CI corre lo mismo y tiene que pasar para mergear.

## Reglas de dotframe (no negociables)

- Todo el estado del juego vive en un objeto y **solo cambia dentro de `step()`**. `render()` solo lee.
- La aleatoriedad sale del generador con semilla de la sim, nunca de `Math.random()`.
- En código de simulación usa `dotframe/src/detmath` en lugar de `Math.sin/cos/exp/pow` y `**`; `dotframe doctor` lo revisa.
- Cuando una mecánica funcione, graba una replay: `cd apps/game && dotframe replay record replays/<mecanica>.json --mash 7`.
- Si un cambio altera el gameplay a propósito, vuelve a grabar las replays afectadas y explícalo en el PR. Si no lo altera, `dotframe replay rebase replays/*.json` lo demuestra.
- No des por buena una tarea visual mirando solo el JSON: `bun run snap` y mira el PNG.

## Convenciones de código

- TypeScript strict.
- Un sistema por módulo dentro de `apps/game/src/` (`player/`, `enemy/`, `combat/`, `world/`, `ui/`, …). Los números de gameplay van en un solo archivo de configuración.
- La sim corre a paso fijo de 60 Hz: velocidades en unidades por frame o multiplicadas por el paso fijo, nunca por el tiempo real del frame.
- Assets: solo CC0 o hechos por el equipo. Decláralos en `dotframe.json` y en `CREDITS.md` (ver `dotframe skills get assets`).

## Trabajar con agentes (Claude Code, Codex, Cursor)

- Las instrucciones para agentes están en [AGENTS.md](AGENTS.md); `CLAUDE.md` lo importa.
- La skill oficial de dotframe viene con el repo (`apps/game/.agents/skills/dotframe`, enlazada en `.claude/skills/`). El agente debe correr `dotframe skills get core` antes de tocar el juego.
- Skills de game dev complementarias (diseño, assets CC0):

```bash
npx skills add Jibaru/skills --skill gamedev --skill game-design-doc --skill game-assets -a claude-code
```
