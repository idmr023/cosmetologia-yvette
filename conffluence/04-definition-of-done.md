h1. 04 — Definition of Done (DoD)

Toda User Story marcada como "Done" debe cumplir *todos* los siguientes criterios:

h2. Criterios técnicos

- *TypeScript*: {{tsc --noEmit}} sin errores (strict mode)
- *Lint*: {{eslint}} sin errores ni warnings
- *Build*: {{npm run build}} exitoso (frontend + backend)
- *Unit tests*: las pruebas unitarias nuevas pasan (si aplica)
- *E2E tests*: los tests de Playwright del flujo afectado pasan
- *Hydration*: sin warnings de hidratación en consola del navegador

h2. Criterios de producto

- *Aceptación del PO*: la funcionalidad se demuestra en Sprint Review y se marca como "Accepted" en el Sprint Backlog
- *UX mobile-first*: la funcionalidad es utilizable en viewport < 640px (mobile) y ≥ 1024px (desktop)
- *Touch targets*: todos los botones y enlaces miden mínimo 44×44px
- *Sin alert()/prompt()*: las interacciones del usuario usan la UI del sistema (modales, sheets, toasts)
- *Código sin comentarios*: el código nuevo no incluye comentarios superfluos (salvo lógica no obvia)

h2. Criterios de integridad

- *Cobertura de migración*: si hubo cambios de schema, la migración Drizzle está generada y aplicada
- *Seed actualizado*: si se agregaron tablas, el seed script las considera
- *CHANGELOG actualizado*: el archivo {{docs/CHANGELOG.md}} refleja los cambios de la release
- *Logs seguros*: ningún secret/token/password se loggea en ninguna capa
- *Sin regresiones*: los tests existentes continúan pasando
