# THE LAST EMPLOYEE

Comedia de acción FPS: el último trabajador humano lucha a puñetazos contra hordas de robots de inteligencia artificial.

- Concepto e inspiración: [docs/CONCEPT.md](docs/CONCEPT.md)
- Alcance y criterios de cada entrega: [docs/ROADMAP.md](docs/ROADMAP.md)
- Cómo colaborar: [CONTRIBUTING.md](CONTRIBUTING.md)

> **Estado:** setup base. `apps/game` es el template `blank` de dotframe (dos cuadrados que se mueven) y sirve para probar que el toolchain funciona. El gameplay arranca con la Vertical Slice 0.1.

## Stack

[dotframe](https://dotframe.crafter.games/): motor de juegos en TypeScript con CLI pensado para agentes. Simulación determinista a paso fijo, renderer WebGPU (2D y 3D), y un mismo código para web, Discord, macOS, Windows e iPhone. Corre sobre [Bun](https://bun.sh). Sin backend ni assets comerciales.

## Requisitos

- [Bun](https://bun.sh) 1.3 o superior
- dotframe CLI: `npm i -g dotframe`
- Navegador con WebGPU (Chrome o Edge recientes) para `dev` y `snap`

`dotframe doctor` revisa el toolchain. Para jugar y desarrollar en web basta con que `bun`, `config`, `sim` y `sim:render` salgan OK. Los avisos de `scriptc`, `vendor`, `xcodegen` y `deploy` solo importan para builds nativos o para publicar.

## Instalación

```bash
git clone git@github.com:PiaRivas/The-last-employee.git
cd The-last-employee
bun install
bun run dev
```

## Scripts (desde la raíz)

| Comando             | Qué hace                                                                  |
| ------------------- | ------------------------------------------------------------------------- |
| `bun run dev`       | Compila para web, lo sirve y recompila al guardar (`dotframe dev`)        |
| `bun run sim`       | Juega 600 frames headless con inputs al azar y devuelve el estado en JSON |
| `bun run snap`      | Renderiza el frame 300 a `apps/game/.dotframe/snap-300.png`               |
| `bun run test`      | Verifica las replays doradas (`apps/game/replays/*.json`)                 |
| `bun run typecheck` | TypeScript                                                                |
| `bun run build`     | Build web en `apps/game/dist/web`                                         |
| `bun run doctor`    | Diagnóstico del toolchain y de la sim                                     |
| `bun run format`    | Prettier                                                                  |

## Estructura (monorepo, Bun workspaces)

```
The-last-employee/
├── apps/
│   └── game/                 # el juego (proyecto dotframe)
│       ├── dotframe.json     # targets: web, discord, macos, windows, ios
│       ├── sim.ts            # contrato Sim que usa el CLI
│       ├── src/game.ts       # estado, step() y render()
│       ├── src/setup.ts      # input y loop
│       ├── main.web.ts       # entrada web (también main.native.ts y main.ios.ts)
│       ├── replays/          # replays doradas = tests de regresión
│       └── AGENTS.md         # guía de dotframe para agentes
├── packages/                 # librerías compartidas (vacío por ahora)
├── docs/                     # concepto, roadmap y decisiones
├── .claude/skills/dotframe   # enlace a la skill de dotframe para Claude Code
└── .github/workflows/        # CI: formato, typecheck, replays y build
```

## Controles

Se definen en la Vertical Slice 0.1 (WASD, salto, esquiva, puños con clic izquierdo y derecho, Esc para pausar). Esta sección se completa cuando estén implementados.

## Cómo probar

- **Hoy:** `bun run sim` devuelve `"ok": true`; `bun run test` imprime `ok replays/smoke.json`; `bun run dev` muestra dos cuadrados que se mueven.
- **Vertical Slice 0.1:** criterios de aceptación en [docs/ROADMAP.md](docs/ROADMAP.md).
- **Bucle de verificación:** cambias código, corres `sim` (estado en JSON), luego `snap` (miras el PNG) y después `test` (las replays siguen pasando). Si un cambio mueve el gameplay a propósito, vuelve a grabar las replays y dilo en el PR.
