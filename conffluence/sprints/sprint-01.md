h1. Sprint 01 — Base técnica + Landing

*Release*: v0.1.0 | *Período*: Semana 01–04 (Año 1) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Establecer la base técnica y la presencia web del centro
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-001 | Como visitante, quiero ver la landing con servicios, galería y CTA | 5 | ✅ |
| US-002 | Como admin, quiero landing mobile-first y responsive | 3 | ✅ |
| US-004 | Como admin, quiero iniciar sesión con email + password | 8 | ✅ |
| TSK-001 | Configurar Drizzle ORM + Neon PostgreSQL + schema inicial | 2 | ✅ |
| *Total* | | *18* | *✅* |

h2. Daily highlights

- D1–D5: Setup Next.js 14 + Tailwind + Drizzle. Conexión a Neon
- D6–D10: Schema de 10 tablas (users, clients, colaboradores, services, appointments, inventory, etc.)
- D11–D15: Landing (Hero, About, Services, Gallery, CTA, Footer) con paleta dorada/negra
- D16–D20: Auth con NextAuth + bcrypt. Seed con admin + 3 colaboradoras + 26 servicios

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: "La landing se ve profesional, me gusta el dorado" — Yvette
{quote}

h2. Retrospective actions

- Documentar setup de BD desde el inicio
- Crear {{.env.example}} con defaults
- Configurar CI desde Sprint 02
