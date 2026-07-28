h1. Sprint 02 — Booking público + Panel admin

*Release*: v0.1.0 | *Período*: Semana 05–08 (Año 1) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Permitir que los clientes reserven citas online sin registro y que el admin gestione la agenda
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-009 | Como cliente, quiero reservar cita online sin registro | 13 | ✅ |
| US-013 | Como admin, quiero dashboard con KPIs | 13 | ✅ (parcial) |
| US-014 | Como admin, quiero CRUD de citas con filtros | 8 | ✅ |
| *Total* | | *34* | *✅* Sprint comprometió 18 pts iniciales, completó 18 |

h2. Daily highlights

- D1–D5: Booking multi-step (servicio → colaboradora → fecha/hora → datos)
- D6–D10: Dashboard admin con citas del día
- D11–D15: CRUD citas con filtros por estado/fecha/colaboradora
- D16–D20: *Impedimento*: BD tenía tablas Laravel legacy → script de migración manual

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: "Reservar sin login es justo lo que necesito" — Yvette
{quote}

h2. Retrospective actions

- *Stop*: Asumir que la BD está limpia
- *Start*: Script {{verify-db.ts}} para diagnóstico rápido
- Crear script de migración manual (drizzle-kit push no funciona con tablas legacy)
