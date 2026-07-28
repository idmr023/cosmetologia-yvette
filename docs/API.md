# API REST

Base URL: `http://localhost:4000/api` (desarrollo)

## Salud

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check del servidor |

## Autenticación

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login con email + password |
| `/api/auth/register` | POST | Registro de cliente |
| `/api/auth/refresh` | POST | Renovar access token (refresh token rotation) |
| `/api/auth/recuperar/get-question` | POST | Obtener pregunta de seguridad |
| `/api/auth/recuperar/verify-answer` | POST | Verificar respuesta de seguridad |
| `/api/auth/recuperar/reset-password` | POST | Resetear contraseña |

## MFA (Autenticación multifactor)

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `POST /api/auth/mfa/setup` | POST | Sí | Generar secreto y QR |
| `POST /api/auth/mfa/verify` | POST | Sí | Verificar código y habilitar MFA |
| `POST /api/auth/mfa/validate` | POST | No | Validar código MFA (userId + code) |
| `GET /api/auth/mfa/status` | GET | Sí | Consultar si MFA está habilitado |

## CRUD Principal

### Citas (`/api/appointments`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar (paginado) | admin/colaborador |
| POST | Crear | admin/colaborador |
| PUT `/:id` | Actualizar estado | admin/colaborador |
| DELETE `/:id` | Eliminar | admin |
| GET `/public` | Obtener datos landing (servicios, colaboradores) o cita por `?id=` | público |
| POST `/public` | Crear cita desde landing pública | público |

### Clientes (`/api/clients`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar (paginado) | admin/colaborador |
| POST | Crear | admin/colaborador |
| PUT `/:id` | Actualizar | admin/colaborador |
| DELETE `/:id` | Eliminar | admin |
| GET `/:id/history` | Historial servicios (paginado) | admin/colaborador |

### Servicios (`/api/services`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar (paginado, público) | público |
| POST | Crear | admin |
| PUT `/:id` | Actualizar | admin |
| DELETE `/:id` | Eliminar | admin |

### Colaboradores (`/api/colaboradores`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar (paginado) | admin/colaborador |
| POST | Crear (auto-crea user) | admin |
| PUT `/:id` | Actualizar | admin |
| DELETE `/:id` | Eliminar (cascade user) | admin |

### Inventario (`/api/inventory`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar (paginado) | admin/colaborador |
| POST | Crear | admin/colaborador |
| PUT `/:id` | Actualizar | admin/colaborador |
| DELETE `/:id` | Eliminar | admin |

### Comisiones (`/api/commissions`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar con filtros `?desde=&hasta=&colaboradorId=` (paginado) | admin |
| PUT `/:id` | Marcar pagada | admin |

### Cajas (`/api/cash-registers`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Listar con filtro `?estado=` (paginado) | admin/colaborador |
| POST | Abrir caja | admin/colaborador |
| PUT `/:id` | Cerrar caja | admin/colaborador |
| GET `/:id/movements` | Listar movimientos (paginado) | admin/colaborador |
| POST `/:id/movements` | Registrar movimiento (ingreso/gasto) | admin/colaborador |

### Reportes (`/api/reports`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Estadísticas con filtros `?desde=&hasta=` (paginado) | admin |

### Configuración (`/api/settings`)
| Método | Descripción | Roles |
|--------|-------------|-------|
| GET | Obtener configuraciones (todas o filtradas por `?keys=key1,key2`) | público |
| PUT | Crear o actualizar `{ key, value }` | admin |

## Convenciones

### Respuestas
- **Objeto único**: respuesta directa sin envoltura (`{ id, name, ... }`)
- **Lista paginada**: `{ data: T[], total: number, offset: number, limit: number }`
- **Error**: `{ error: string }`

### Códigos HTTP
| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validación) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicado) |
| 423 | Locked (cuenta bloqueada) |
| 429 | Too Many Requests (rate limit) |

### Paginación
Activa en todos los GET de listados. Parámetros:
- `?offset=0&limit=50` (default: offset=0, limit=50)

### Fechas
ISO 8601 con timezone.

### Filtros
Query params: `?status=pendiente&desde=2024-01-01&hasta=2024-12-31`
