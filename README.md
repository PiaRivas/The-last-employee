# THE LAST EMPLOYEE

Comedia de acción FPS para navegador: el último trabajador humano lucha a puñetazos contra hordas de robots de inteligencia artificial.

- Concepto e inspiración: [docs/CONCEPT.md](docs/CONCEPT.md)
- Alcance y criterios de cada entrega: [docs/ROADMAP.md](docs/ROADMAP.md)
- Cómo colaborar: [CONTRIBUTING.md](CONTRIBUTING.md)

> **Estado:** setup base. `npm run dev` levanta una escena de prueba del stack (una caja que cae con físicas). El gameplay arranca con la Vertical Slice 0.1.

## Stack

Three.js · TypeScript (strict) · Vite · Rapier 3D (`@dimforge/rapier3d-compat`). Sin backend, sin frameworks de UI, sin assets comerciales.

## Requisitos

- Node.js 20 o superior (recomendado 22, ver `.nvmrc`)
- npm 10 o superior

## Instalación

```bash
git clone git@github.com:PiaRivas/The-last-employee.git
cd The-last-employee
npm install
npm run dev
```

Abre <http://localhost:5173>.

## Scripts (desde la raíz)

| Comando                           | Qué hace                                             |
| --------------------------------- | ---------------------------------------------------- |
| `npm run dev`                     | Dev server del juego con hot reload                  |
| `npm run build`                   | Typecheck y build de producción en `apps/game/dist/` |
| `npm run preview`                 | Sirve el build de producción                         |
| `npm run typecheck`               | Solo TypeScript, en todos los workspaces             |
| `npm run format` / `format:check` | Prettier                                             |

Los argumentos extra pasan a Vite: `npm run dev -- --port 4000 --host`.

## Estructura (monorepo, npm workspaces)

```
The-last-employee/
├── apps/
│   └── game/              # el juego (Vite + Three.js + Rapier)
│       ├── index.html
│       ├── src/main.ts    # bootstrap; hoy es la escena de prueba del stack
│       └── public/        # assets estáticos (servidos tal cual)
├── packages/              # librerías compartidas (vacío por ahora)
├── docs/                  # concepto, roadmap y decisiones
├── tsconfig.base.json     # config TS compartida
└── .github/workflows/     # CI: typecheck y build en cada PR
```

## Controles

Se definen en la Vertical Slice 0.1 (WASD, salto, esquiva, puños con clic izquierdo y derecho, Esc para pausar). Esta sección se completa cuando estén implementados.

## Cómo probar

- **Hoy:** `npm run dev` debe mostrar el texto _"stack OK"_ y una caja roja que cae sobre el piso, sin errores en la consola.
- **Vertical Slice 0.1:** ver los criterios de aceptación en [docs/ROADMAP.md](docs/ROADMAP.md).
- **Tests automáticos:** el juego expone `window.__TEST__.state()` (solo lectura) para playtests con Playwright.
