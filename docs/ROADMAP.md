# Roadmap

## Vertical Slice 0.1 — base jugable (siguiente)

Primer prototipo funcional. Todo lo de abajo vive en `apps/game`.

### Alcance

1. Oficina corporativa low-poly: suelo, paredes, escritorios y monitores.
2. Cámara en primera persona con Pointer Lock API.
3. Movimiento WASD, salto y esquiva.
4. Dos puños visibles que atacan con los clics del mouse.
5. Un robot enemigo de geometrías simples, con vida y reacción al daño.
6. Detección de impactos a corta distancia.
7. HUD con barra de salud y contador de enemigos eliminados.
8. Pantalla de inicio con instrucciones y opción de reinicio.
9. Pausa, pérdida de foco y liberación del mouse bien manejadas.

### Requisitos técnicos

- Código modular y mantenible.
- Movimiento independiente del FPS de pantalla: la sim de dotframe avanza a paso fijo de 60 Hz.
- Sin assets comerciales ni APIs externas; sin backend ni autenticación.
- Prioridad a fluidez y bajo consumo de recursos (`dotframe perf`).
- Sin frameworks de interfaz innecesarios.
- `bun run typecheck`, `bun run test` y `bun run build` pasan antes de cerrar la entrega.
- Una replay dorada por mecánica (movimiento con colisión, puñetazo, muerte del robot, reinicio).

### Criterios de aceptación

- [ ] El jugador se mueve por la oficina sin atravesar objetos sólidos.
- [ ] Los puñetazos tienen animación y solo dañan enemigos dentro de su alcance.
- [ ] El robot recibe daño, muestra una reacción visual y desaparece al llegar a cero de vida.
- [ ] El juego se reinicia sin recargar la página.
- [ ] El proyecto corre localmente con `bun run dev`.

### Reparto

El esqueleto (rama `chore/skeleton-3d`) ya fija lo que comparten las dos personas: la forma del estado (`src/state.ts`), el input empaquetado (`src/input.ts`), los números (`src/config.ts`) y el orden de los sistemas en `step()` (`src/game.ts`). Cada quien trabaja en sus carpetas y busca sus `TODO(VS 0.1, …)`.

| Persona                | Carpetas                                             | Alcance                                                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A: mundo y jugador     | `src/world/`, `src/player/`                          | 1 (oficina), 3 (salto y esquiva) y la colisión jugador contra cajas en `world/collision.ts`                                                                                                                        |
| B: combate, robot y UI | `src/combat/`, `src/enemy/`, `src/ui/`, `src/audio/` | 4 (curva del puño), 5 (que el robot camine y ataque), 7 (HUD con fuente), 8 y 9 (inicio, pausa, reinicio). Ya hecho: impacto con alcance y ángulo, robot con ojos rojos que mira al jugador, sonidos de golpe y KO |

Reglas para no pisarse:

- `state.ts`, `input.ts`, `config.ts` y `game.ts` son compartidos: cambios chicos, en su propio PR, y avisando a la otra persona.
- Si agregas un campo al estado, actualiza `createGame`, `snapshot`, `restore` y `checksum` en el mismo commit.
- PRs chicos y seguido contra `main`. Al rebasar, si una replay deja de pasar por un cambio del otro, vuelve a grabarla y dilo en el PR.

### Fuera de alcance (todavía)

Oleadas, múltiples enemigos, jefes, multijugador y cualquier función adicional.

### Decisiones abiertas

- **Colisiones 3D.** `dotframe/src/physics` solo resuelve cajas en un plano 2D. Para la oficina (paredes, escritorios, robot) la opción recomendada es colisión propia y determinista dentro de `step()`: el jugador como cilindro contra cajas alineadas a los ejes. Usar Rapier rompería el `save/restore` de la sim y los builds nativos.
- **Plantilla de partida.** Resuelta: el esqueleto reemplaza el template `blank` por una escena 3D (`createRenderer(platform.gpu)` y `run(..., { pointerLock: true })`). El juego es de un jugador; se quitó el netplay del template.
- **Mouse look determinista.** Resuelto: el giro de cámara viaja dentro del input de cada frame (8 bits con signo para yaw y 8 para pitch, en pasos de `LOOK.step`), así que las replays y `sim` lo reproducen igual.

## Después de 0.1

Por definir con el equipo una vez la base sea jugable y verificable.
