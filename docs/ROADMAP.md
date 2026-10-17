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

### Fuera de alcance (todavía)

Oleadas, múltiples enemigos, jefes, multijugador y cualquier función adicional.

### Decisiones abiertas

- **Colisiones 3D.** `dotframe/src/physics` solo resuelve cajas en un plano 2D. Para la oficina (paredes, escritorios, robot) la opción recomendada es colisión propia y determinista dentro de `step()`: el jugador como cilindro contra cajas alineadas a los ejes. Usar Rapier rompería el `save/restore` de la sim y los builds nativos.
- **Plantilla de partida.** `apps/game` es el template `blank` (2D). La VS 0.1 lo reemplaza por una escena 3D (`createRenderer(platform.gpu)` y `run(..., { pointerLock: true })`, ver `dotframe skills get core` → "3D games"). Referencia de un FPS 3D hecho con dotframe: [the-ones-game](https://github.com/crafter-games/the-ones-game).

## Después de 0.1

Por definir con el equipo una vez la base sea jugable y verificable.
