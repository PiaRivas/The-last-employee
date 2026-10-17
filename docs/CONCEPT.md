# THE LAST EMPLOYEE — Concepto

> Comedia de acción FPS: el último trabajador humano lucha contra hordas de robots de inteligencia artificial que quieren quedarse con su puesto.

## Inspiración

- **[FIGHTQUEST](https://store.steampowered.com/app/3685570/FIGHTQUEST/)** (Steam) — combate cuerpo a cuerpo en primera persona, puños visibles, impacto físico y ritmo arcade.

## Pilares

1. **Puños con peso.** El combate cuerpo a cuerpo tiene que sentirse bien: anticipación, impacto, reacción del enemigo.
2. **Comedia corporativa.** Oficina low-poly, robots con corbata, humor de oficina contra la IA.
3. **Fluidez antes que fidelidad.** Low-poly, pocos draw calls, 60 FPS en una laptop normal.
4. **Base verificable.** Cada entrega es jugable y tiene criterios de prueba (ver [ROADMAP.md](ROADMAP.md)).

## Stack

| Pieza                | Elección                                                                         |
| -------------------- | -------------------------------------------------------------------------------- |
| Motor                | [dotframe](https://dotframe.crafter.games/): sim determinista a paso fijo, 60 Hz |
| Render               | Renderer WebGPU de dotframe (escena 3D + HUD 2D en el mismo frame)               |
| Lenguaje             | TypeScript (strict)                                                              |
| Runtime / build      | Bun + `dotframe dev` / `dotframe build`                                          |
| Físicas y colisiones | Por decidir (ver [ROADMAP.md](ROADMAP.md#decisiones-abiertas))                   |
| Targets              | Web primero; Discord, macOS, Windows e iPhone salen del mismo código             |

> El brief original pedía Three.js + Vite + Rapier 3D. Lo cambiamos por dotframe porque deja que un agente juegue el juego sin pantalla (sim, snap, replays), y eso hace cada entrega verificable.

## Restricciones

- Sin assets comerciales ni APIs externas. Geometría procedural o assets CC0.
- Sin backend ni autenticación.
- HUD y menús con la capa 2D de dotframe (`dotframe/src/ui`), sin frameworks de UI.
- Simulación determinista: el estado solo cambia en `step()`, RNG con semilla y `detmath`.
