h1. Centro de Estética Yvette — Documentación SCRUM

Bienvenido a la documentación oficial del proyecto *Centro de Estética Yvette* bajo la metodología *SCRUM*. Este sitio Confluence contiene el registro completo del desarrollo del sistema integral de gestión para el centro de estética, abarcando 2 años de desarrollo a través de 12 Sprints de 4 semanas.

h2. Índice de páginas

|| # || Archivo || Contenido ||
| 1 | [01-vision-producto.md|./01-vision-producto.md] | Product Vision, Product Goal, stakeholders |
| 2 | [02-roles-equipo.md|./02-roles-equipo.md] | Roles SCRUM (PO, SM, Dev Team) |
| 3 | [03-product-backlog.md|./03-product-backlog.md] | Épicas y User Stories priorizadas |
| 4 | [04-definition-of-done.md|./04-definition-of-done.md] | Criterios de Definition of Done |
| 5 | [05-roadmap-releases.md|./05-roadmap-releases.md] | Roadmap 2 años con releases |
| 6 | [06-sprint-planning.md|./06-sprint-planning.md] | Planificación de Sprint |
| 7 | [07-sprint-backlog.md|./07-sprint-backlog.md] | Sprint Backlog y estado actual |
| 8 | [08-daily-scrum.md|./08-daily-scrum.md] | Daily Scrum asincrónico |
| 9 | [09-sprint-review.md|./09-sprint-review.md] | Sprint Review y criterios |
| 10 | [10-sprint-retrospective.md|./10-sprint-retrospective.md] | Retrospectivas por Sprint |
| 11 | [11-velocidad-burndown.md|./11-velocidad-burndown.md] | Velocity, Burndown, Forecast |
| 12 | [12-incremento-release-notes.md|./12-incremento-release-notes.md] | Release notes del Incremento |

h2. Historial de Sprints

|| Sprint || Release || Período || Goal ||
| [Sprint 01|./sprints/sprint-01.md] | v0.1.0 | Sem 01–04 (Año 1) | MVP: Landing + Auth + Seed |
| [Sprint 02|./sprints/sprint-02.md] | v0.1.0 | Sem 05–08 (Año 1) | Booking público + panel admin |
| [Sprint 03|./sprints/sprint-03.md] | v0.1.0 | Sem 09–12 (Año 1) | Panel colaborador + auth completa |
| [Sprint 04|./sprints/sprint-04.md] | v0.2.0 | Sem 13–16 (Año 1) | Refactor Backend Express + DAO |
| [Sprint 05|./sprints/sprint-05.md] | v0.2.0 | Sem 17–20 (Año 1) | Middleware stack + cash + comisiones |
| [Sprint 06|./sprints/sprint-06.md] | v0.2.0 | Sem 21–24 (Año 1) | Seguridad: Argon2, JWT, MFA, RLS |
| [Sprint 07|./sprints/sprint-07.md] | v0.3.0 | Sem 25–28 (Año 2) | Auto-agendamiento + notificaciones |
| [Sprint 08|./sprints/sprint-08.md] | v0.3.0 | Sem 29–32 (Año 2) | Fidelización + reseñas |
| [Sprint 09|./sprints/sprint-09.md] | v0.3.0 | Sem 33–36 (Año 2) | Dashboard analítico + e-commerce |
| [Sprint 10|./sprints/sprint-10.md] | v0.4.0 | Sem 37–40 (Año 2) | Playwright E2E + CI/CD |
| [Sprint 11|./sprints/sprint-11.md] | v0.4.0 | Sem 41–44 (Año 2) | Documentación + monitoreo + performance |
| [Sprint 12|./sprints/sprint-12.md] | v0.4.0 | Sem 45–48 (Año 2) | Bug fixes, tuning, cierre |

h2. Convenciones

- *User Stories*: {{"Como [rol], quiero [funcionalidad], para [beneficio]"}}
- *Story Points*: escala Fibonacci (1, 2, 3, 5, 8, 13, 21)
- *DoD*: Definition of Done verificable (build, lint, typecheck, tests)
- *Sprint Goal*: objetivo único y medible por Sprint
