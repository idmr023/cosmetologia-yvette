# Base de Datos

## Stack
- PostgreSQL v16 (Neon Serverless)
- Drizzle ORM (type-safe, schema-first)
- Migraciones en `backend/drizzle/`

## Schema (fuente única: `src/lib/schema.ts`)

### Tablas Principales
| Tabla | Propósito | PK | FK |
|-------|-----------|----|----|
| `users` | Cuentas de usuario / auth | `uuid` | — |
| `clients` | Clientes del negocio | `uuid` | — |
| `colaboradores` | Empleadas / estilistas | `uuid` | `users.id` |
| `services` | Servicios ofrecidos | `uuid` | — |
| `appointments` | Citas agendadas | `uuid` | `clients.id`, `colaboradores.id` |
| `appointment_services` | Servicios por cita (M:N) | composite | `appointments.id`, `services.id` |
| `inventory` | Productos / insumos | `uuid` | — |

### Tablas Transaccionales
| Tabla | Propósito |
|-------|-----------|
| `commissions` | Comisiones a colaboradoras |
| `cash_registers` | Apertura/cierre de caja |
| `cash_movements` | Ingresos/egresos de caja |
| `service_history` | Historial de servicios por cliente |

### Tablas de Seguridad
| Tabla | Propósito |
|-------|-----------|
| `audit_log` | Eventos de autenticación (login/logout/fallos) |
| `login_attempts` | Intentos de login por IP/email |
| `settings` | Configuración global (key-value) |

### Tablas de Auditoría (WORM)
| Tabla | Propósito |
|-------|-----------|
| `audit_logs` | Registro inmutable de cambios DML |

## Seguridad
- **RLS:** Row Level Security habilitado en tablas transaccionales
- **pgcrypto:** `pgp_sym_encrypt` en columnas sensibles (teléfono, email)
- **Hash determinista:** `digest(col, 'sha256')` para búsquedas exactas sin revelar texto plano
- **Particionamiento:** `audit_logs` particionada por rango mensual

## Indexación
- `(tenant_id, created_at)` B-tree en tablas transaccionales
- `(tenant_id, status)` para filtros de estado
- FK indexes en todas las columnas con `REFERENCES`
