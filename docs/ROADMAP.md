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
- Movimiento independiente de FPS mediante delta time.
- Sin assets comerciales ni APIs externas; sin backend ni autenticación.
- Prioridad a fluidez y bajo consumo de recursos.
- Sin frameworks de interfaz innecesarios.
- `npm run build` pasa sin errores antes de cerrar la entrega.

### Criterios de aceptación

- [ ] El jugador se mueve por la oficina sin atravesar objetos sólidos.
- [ ] Los puñetazos tienen animación y solo dañan enemigos dentro de su alcance.
- [ ] El robot recibe daño, muestra una reacción visual y desaparece al llegar a cero de vida.
- [ ] El juego se reinicia sin recargar la página.
- [ ] El proyecto corre localmente con `npm run dev`.

### Fuera de alcance (todavía)

Oleadas, múltiples enemigos, jefes, multijugador y cualquier función adicional.

## Después de 0.1

Por definir con el equipo una vez la base sea jugable y verificable.
