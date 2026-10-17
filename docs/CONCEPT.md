# THE LAST EMPLOYEE — Concepto

> Comedia de acción FPS: el último trabajador humano lucha contra hordas de robots de inteligencia artificial que quieren quedarse con su puesto.

## Inspiración

- **[FIGHTQUEST](https://store.steampowered.com/app/3685570/FIGHTQUEST/)** (Steam) — combate cuerpo a cuerpo en primera persona, puños visibles, impacto físico y ritmo arcade.

## Pilares

1. **Puños con peso.** El combate cuerpo a cuerpo tiene que sentirse bien: anticipación, impacto, reacción del enemigo.
2. **Comedia corporativa.** Oficina low-poly, robots con corbata, humor de oficina contra la IA.
3. **Fluidez antes que fidelidad.** Low-poly, pocos draw calls, 60 FPS en una laptop normal.
4. **Base verificable.** Cada entrega es jugable y tiene criterios de prueba (ver [ROADMAP.md](ROADMAP.md)).

## Stack obligatorio

| Pieza                | Elección                                |
| -------------------- | --------------------------------------- |
| Render               | Three.js                                |
| Lenguaje             | TypeScript (strict)                     |
| Bundler / dev server | Vite                                    |
| Físicas y colisiones | Rapier 3D (`@dimforge/rapier3d-compat`) |

## Restricciones

- Sin assets comerciales ni APIs externas. Geometría procedural o assets CC0.
- Sin backend ni autenticación.
- Sin frameworks de UI innecesarios: HUD y menús en DOM + CSS.
- Movimiento independiente de FPS (delta time).
