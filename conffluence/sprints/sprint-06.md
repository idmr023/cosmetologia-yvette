h1. Sprint 06 — Seguridad: Argon2 + JWT + MFA + RLS

*Release*: v0.2.0 | *Período*: Semana 21–24 (Año 1) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Endurecer la seguridad del sistema a nivel OWASP
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-007 | MFA/TOTP opcional | 8 | ✅ |
| US-008 | Almacenar contraseñas con Argon2id | 3 | ✅ |
| TSK-005 | Refresh tokens con rotación (Access 15min + Refresh 7d) | 5 | ✅ |
| TSK-006 | Row Level Security en tablas transaccionales | 5 | ✅ |
| TSK-007 | Auditoría WORM con triggers AFTER ROW | 5 | ✅ |
| *Total* | | *26* | *✅* |

h2. Daily highlights

- D1–D5: Argon2id + migración automática bcrypt→argon2 en login
- D6–D10: JWT access/refresh tokens con rotación. Tabla {{refresh_tokens}}
- D11–D14: MFA/TOTP con otplib + QR code generation
- D15–D18: RLS en 5 tablas (appointments, commissions, cash_registers, inventory, orders)
- D19–D20: Audit logs WORM con triggers AFTER ROW capturando OLD/NEW en JSONB

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: MFA configurado para admin
{quote}

h2. Retrospective actions

- *Start*: Verificar compatibilidad de hash antes de migrar bcrypt→argon2
- *Stop*: Migrar hashes en lote sin rollback
- {{tryMigrateToArgon2}} en login exitoso (no en lote)
