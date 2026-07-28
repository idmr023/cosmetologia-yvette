h1. 11 — Velocity & Burndown

h2. Velocity histórica

|| Sprint || Release || Story Points || Estado ||
| Sprint 01 | v0.1.0 | 18 | ✅ Completado |
| Sprint 02 | v0.1.0 | 18 | ✅ Completado |
| Sprint 03 | v0.1.0 | 18 | ✅ Completado |
| Sprint 04 | v0.2.0 | 24 | ✅ Completado |
| Sprint 05 | v0.2.0 | 25 | ✅ Completado |
| Sprint 06 | v0.2.0 | 26 | ✅ Completado |
| Sprint 07 | v0.3.0 | 30 | ✅ Completado |
| Sprint 08 | v0.3.0 | 32 | ✅ Completado |
| Sprint 09 | v0.3.0 | 31 | ✅ Completado |
| Sprint 10 | v0.4.0 | 22 | ✅ Completado |
| Sprint 11 | v0.4.0 | 22 | ✅ Completado |
| Sprint 12 | v0.4.0 | 22 | ✅ Completado |

h3. Velocity promedio

|| Período || Velocity promedio || Tendencia ||
| Sprints 01–03 (early) | 18 pts | Curva de aprendizaje |
| Sprints 04–06 (refactor) | 25 pts | Estabilización |
| Sprints 07–09 (features) | 31 pts | Pico de productividad |
| Sprints 10–12 (testing docs) | 22 pts | Calidad sobre cantidad |

*Velocity general*: 248 pts ÷ 12 sprints = *20.7 pts/sprint*

h2. Burndown total del proyecto

{code}
Total backlog: 249 pts
Total entregado: 248 pts
Cobertura: 99.6%
{code}

h3. Burndown chart (acumulado)

{code}
Pts
250 ┤                                                    ●
    │                                                 ●
200 ┤                                            ●
    │                                         ●
150 ┤                                   ●
    │                              ●
100 ┤                         ●
    │                    ●
 50 ┤              ●
    │         ●
  0 ┤──●──●──●──●──●──●──●──●──●──●──●──●──
      1  2  3  4  5  6  7  8  9 10 11 12
                                  Sprint
{code}

h3. Burndown del Sprint 12 (último sprint)

{code}
Capacity: 22 pts
Duración: 20 días hábiles

Pts
25 ┤ ●
   │  ●
20 ┤    ●
   │       ●
15 ┤          ●
   │             ●
10 ┤                ●
   │                   ●
 5 ┤                      ●
   │                         ●
 0 ┤                            ●──
    D1 D3 D5 D7 D9 D11 D13 D15 D17 D19
{code}

|| Día || Pts pendientes || Evento ||
| 1 | 22 | Sprint Planning |
| 3 | 22 | Daily: inicio TSK-001 (hydration fix) |
| 5 | 19 | TSK-001 completado ✅ |
| 7 | 17 | TSK-002 completado (lazy loading) ✅ |
| 9 | 15 | TSK-003: login hash bug — tomó más tiempo |
| 11 | 10 | TSK-003 completado ✅ |
| 13 | 8 | TSK-004 + TSK-005 completados ✅ |
| 15 | 6 | TSK-006: circuit breaker implementado ✅ |
| 17 | 3 | TSK-007: documentación en progreso |
| 19 | 0 | TSK-007 completado. Sprint Review ✅ |

h2. Forecast

h3. Capacidad proyectada post-entrega

|| Período || Capacidad esperada || Actividad ||
| Mes 1 post-entrega | 15 pts (50%) | Soporte, bug fixes críticos |
| Mes 2-3 post-entrega | 10 pts (30%) | Features futuras: pasarela de pagos real, app mobile nativa |

h3. Escenarios futuros

|| Feature || Pts estimados || Sprints requeridos || Prioridad ||
| Integración Mercado Pago | 13 | 1 | Alta |
| App mobile (React Native) | 55 | 3 | Media |
| Dashboard colaborador avanzado | 13 | 1 | Baja |
| IA para recomendación de servicios | 21 | 1 | Baja |
