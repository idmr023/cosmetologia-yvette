h1. 07 — Sprint Backlog

h2. Estado actual: Sprint 12 (Sprint final)

*Período*: Semana 45–48 (Año 2)
*Sprint Goal*: "Cerrar deuda técnica y preparar el producto para entrega final"
*Capacity*: 22 pts
*Velocity esperada*: 22 pts (70% focus factor × 20 días × 1 dev)

h3. Sprint Backlog — Sprint 12

|| ID || User Story || Pts || Estado || DoD ||
| TSK-001 | Bug: resolver hydration warnings en panel admin | 3 | ✅ Done | Sin warnings en consola |
| TSK-002 | Performance: lazy loading en landing images | 2 | ✅ Done | Lighthouse > 90 en LCP |
| TSK-003 | Bug: login falla si BD tiene hashes legacy | 5 | ✅ Done | Argon2 y bcrypt coexisten |
| TSK-004 | Chore: limpiar tabla {{login_attempts}} en setup e2e | 2 | ✅ Done | Tests pasan sin lockout |
| TSK-005 | Chore: unificar .env entre frontend y backend | 2 | ✅ Done | Misma DATABASE_URL |
| TSK-006 | Feature: implementar circuit breaker en backend | 5 | ✅ Done | opossum wrapper probado |
| TSK-007 | Docs: completar RELEASE_NOTES para v0.4.0 | 3 | 🔄 In progress | DoD verificado |

*Total comprometido*: 22 pts ✅ *Todos completados*

h3. Plantilla para futuros Sprint Backlog

{code:markdown}
## Sprint [N]

**Período**: Semana [X]–[Y] (Año [Z])
**Sprint Goal**: "[objetivo único]"
**Capacity**: [N] pts (Focus factor × días × devs)

### Sprint Backlog

| ID | User Story | Pts | Estado | DoD |
|----|-----------|:---:|:------:|:---:|
| US-NNN | [Descripción] | [ ] | [ ] | [ ] |

**Total comprometido**: [N] pts | **Completado**: [N] pts
**Velocity**: [N] pts/sprint

### Sprint Goal alcanzado
- [ ] Meta 1
- [ ] Meta 2
{code}

h3. Registro de cambios por Sprint

|| Sprint || Committed || Completed || Defectos encontrados || Defectos resueltos ||
| 01 | 18 | 18 | 2 | 2 |
| 02 | 18 | 18 | 3 | 3 |
| 03 | 18 | 18 | 1 | 1 |
| 04 | 25 | 24 | 4 | 3 |
| 05 | 25 | 25 | 2 | 2 |
| 06 | 25 | 26 | 3 | 3 |
| 07 | 32 | 30 | 5 | 4 |
| 08 | 32 | 32 | 2 | 2 |
| 09 | 32 | 31 | 4 | 3 |
| 10 | 22 | 22 | 2 | 2 |
| 11 | 22 | 22 | 1 | 1 |
| 12 | 22 | 22 | 0 | 0 |
| *Total* | *249* | *248* | *29* | *26* |
