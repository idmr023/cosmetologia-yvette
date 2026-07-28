h1. Sprint 05 — Middleware stack + Cajas + Comisiones

*Release*: v0.2.0 | *Período*: Semana 17–20 (Año 1) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Proteger la API con middleware en capas e implementar módulos financieros
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-021 | Middleware JWT + rate-limit + Helmet + CORS | 8 | ✅ |
| US-018 | Apertura y cierre de caja diaria | 8 | ✅ |
| US-022 | Circuit-breaker + retry pattern | 5 | ✅ |
| TSK-003 | Fix test fallante del Sprint 04 | 2 | ✅ |
| TSK-004 | Fix touch targets < 44px en caja (rechazado en Review) | 2 | ✅ |
| *Total* | | *25* | *✅* |

h2. Daily highlights

- D1–D5: JWT middleware + rate-limit por endpoint
- D6–D10: Cash registers (apertura, cierre, gastos, diferencia)
- D11–D15: Comisiones por colaboradora con status tracking
- D16–D20: *Impedimento*: Yvette dijo "botones pequeños" → fix touch targets 44px

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: Caja funciona en mobile después de fix
{quote}

h2. Retrospective actions

- *Start*: Probar en dispositivo físico antes del Review
- *Start*: Clase {{min-h-touch}} en Tailwind config (44px)
