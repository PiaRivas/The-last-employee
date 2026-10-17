# packages/

Librerías compartidas entre apps del monorepo (por ejemplo, tipos o utilidades comunes). Está vacío a propósito: crea un paquete aquí solo cuando haya código que de verdad se comparta.

Cada paquete lleva su `package.json` con nombre `@tle/<nombre>` y se importa desde las apps como dependencia de workspace.
