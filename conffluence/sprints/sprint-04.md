h1. Sprint 04 — Refactor Backend Express

*Release*: v0.2.0 | *Período*: Semana 13–16 (Año 1) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Separar el backend en un servicio Express independiente sin romper funcionalidad existente
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-019 | Separar backend a Express, API independiente | 13 | ✅ |
| US-020 | Repository Pattern (DAO) — 7 repositorios | 8 | ✅ |
| TSK-002 | Documentar contratos de API en docs/API.md | 3 | ✅ |
| *Total* | | *24* | *✅* (capacity: 25, completado: 24) |

h2. Daily highlights

- D1–D8: Migrar todas las API routes de Next.js a Express (10 módulos)
- D9–D12: Crear 7 repositories (appointment, client, collaborator, commission, inventory, cashRegister, service)
- D13–D16: Configurar proxy de Next.js ({{next.config.mjs}} rewrites → localhost:4000)
- D17–D20: Probar equivalencia funcional. 1 test falla → pasa a Sprint 05

h2. Sprint Review outcome

{quote}
✅ *Aceptado con deuda*: Backend migrado, 1 test falla — pasa a Sprint 05
{quote}

h2. Retrospective actions

- *Start*: Pruebas manuales post-refactor con Postman
- Make {{npm run dev:all}} para lanzar ambos servidores
