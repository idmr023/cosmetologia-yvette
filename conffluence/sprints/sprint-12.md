h1. Sprint 12 — Cierre: Bug fixes + Performance + Release

*Release*: v0.4.0 | *Período*: Semana 45–48 (Año 2) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Cerrar deuda técnica y preparar el producto para entrega final
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| TSK-016 | Bug: resolver hydration warnings en panel admin | 3 | ✅ |
| TSK-017 | Performance: lazy loading en imágenes landing | 2 | ✅ |
| TSK-018 | Bug: login falla si BD tiene hashes legacy (bcrypt vs argon2) | 5 | ✅ |
| TSK-019 | Chore: limpiar tabla login_attempts en setup e2e | 2 | ✅ |
| TSK-020 | Chore: unificar .env entre frontend y backend | 2 | ✅ |
| TSK-021 | Circuit breaker + retry pattern (implementación propia) | 5 | ✅ |
| TSK-022 | Docs: completar release notes v0.4.0 | 3 | ✅ |
| *Total* | | *22* | *✅* |

h2. Daily highlights

- D1–D3: Hydration warnings → {{clean: true}} en next.config + limpiar cache webpack
- D4–D6: Performance: lazy loading imágenes, optimizar Core Web Vitals
- D7–D11: *Bug crítico*: login 401 porque {{tryMigrateToArgon2}} dejó hashes argon2 que el fallback de NextAuth no soporta → sincronizar {{verifyPassword}}
- D12–D14: E2E: setup limpia {{login_attempts}}, Turnstile bypass con test keys
- D15–D17: Circuit breaker propio (reemplaza dependencia opossum)
- D18–D20: Documentación de cierre. CHANGELOG unificado. Release v0.4.0

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: Cero defectos abiertos. 248/249 pts completados (99.6%)
{quote}

h2. Retrospective actions

- *Start*: Planificar mantenimiento post-entrega
- *Stop*: Agregar features nuevas en el último Sprint
- Pendiente: deploy a producción (Railway / Vercel)

----

*Fin del ciclo SCRUM — 12 sprints, 2 años, 248 story points entregados.*
