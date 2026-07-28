h1. Sprint 03 — Panel colaborador + Auth completa

*Release*: v0.1.0 | *Período*: Semana 09–12 (Año 1) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Completar el ecosistema de autenticación y el panel de colaboradoras
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-005 | Como admin, quiero protección contra fuerza bruta (rate limit + lockout) | 5 | ✅ |
| US-006 | Como admin, quiero Google OAuth | 5 | ✅ |
| US-015 | Como admin, quiero CRUD de clientes con historial | 8 | ✅ |
| US-016 | Como admin, quiero CRUD de inventario | 8 | ✅ |
| US-017 | Como admin, quiero reportes de comisiones | 5 | ✅ |
| *Total* | | *31* | *✅* (18 pts comprometidos + carry over) |

h2. Daily highlights

- D1–D6: Colaborador panel (mis citas, escanear QR, perfil)
- D7–D10: Rate limit + lockout + Turnstile
- D11–D14: Google OAuth + sesión JWT
- D15–D20: CRUD clientes + inventario + comisiones

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: Panel colaborador listo para Elizabeth y Lourdes
{quote}

h2. Retrospective actions

- *Start*: Limpiar {{.next/}} en CI antes del build (hydration mismatch)
- *Stop*: Ignorar warnings de consola en desarrollo
