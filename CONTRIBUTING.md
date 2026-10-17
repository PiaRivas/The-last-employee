# Contribuir

## Flujo

1. Crea una rama desde `main`: `feat/<algo>`, `fix/<algo>` o `chore/<algo>`.
2. Commits con [Conventional Commits](https://www.conventionalcommits.org/): `feat(player): add dodge`, `fix(physics): stop tunneling through desks`.
3. Antes de abrir el PR: `npm run typecheck && npm run build && npm run format:check`.
4. Abre el PR contra `main`. El CI corre typecheck y build; tiene que pasar para mergear.

## Convenciones de código

- TypeScript strict. Sin `any` salvo en el borde con APIs externas, y comentado.
- Un sistema por módulo (`player/`, `enemy/`, `combat/`, `ui/`, …). Los números de gameplay viven en un único archivo de configuración, no repartidos por el código.
- Todo movimiento se escala por delta time; nunca asumas 60 FPS.
- HUD y menús en DOM y CSS. No metas frameworks de UI sin acordarlo antes.
- Assets: solo CC0 o hechos por el equipo. Registra autor y licencia en `CREDITS.md` cuando entre el primero.

## Trabajar con agentes (Claude Code, Codex, Cursor)

Las instrucciones para agentes están en [AGENTS.md](AGENTS.md); `CLAUDE.md` lo importa.

Skills de game dev recomendadas para este proyecto (3D web con Three.js):

```bash
# Kit base: pipeline, GDD, assets CC0, playtest con Playwright
npx skills add Jibaru/skills --skill gamedev --skill game-design-doc --skill game-assets --skill game-playtest -a claude-code
# Three.js para juegos y API de Three.js
npx skills add majidmanzarpour/threejs-game-skills -a claude-code
npx skills add CloudAI-X/threejs-skills -a claude-code
```
