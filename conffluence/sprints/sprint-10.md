h1. Sprint 10 — Playwright E2E + CI/CD

*Release*: v0.4.0 | *Período*: Semana 37–40 (Año 2) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Automatizar la validación de calidad con E2E tests y CI
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-034 | E2E tests con Playwright para flujos críticos | 13 | ✅ |
| US-037 | PWA con service worker + offline parcial | 8 | ✅ |
| TSK-012 | CI GitHub Actions (typecheck + lint + build + E2E) | 5 | ✅ |
| *Total* | | *26* | *✅* (capacity: 22, completed: 22) |

h2. Daily highlights

- D1–D8: Migrar de Cypress a Playwright (16 spec files)
- D9–D12: Global setup de auth, bypass Turnstile con test keys
- D13–D16: CI con 3 jobs (frontend, backend, E2E), 4 workers, ~8 min
- D17–D20: PWA: service worker, RegisterSW, cache API con idb-keyval (TTL 5 min), sync queue offline

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: CI verde en 8 min. E2E cubren flujos públicos + admin + colaborador
{quote}

h2. Retrospective actions

- *Start*: Usar {{globalSetup}} para auth E2E
- *Stop*: Escribir tests sin seed de datos dedicado
