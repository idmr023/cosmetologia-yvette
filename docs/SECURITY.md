# Seguridad

## Stack de Seguridad

| Capa | Tecnología |
|------|-----------|
| Hashing passwords | Argon2id (migrado desde bcrypt) |
| Autenticación | JWT (Access 15min + Refresh 7d httpOnly) |
| MFA | TOTP (otplib + Google Authenticator) |
| OAuth | Google Login (manteniendo credentials) |
| Rate Limiting | express-rate-limit + LRU cache |
| Captcha | Cloudflare Turnstile |
| Row Security | PostgreSQL RLS + `current_setting('app.tenant_id')` |
| Column Encryption | pgcrypto AES-256 (`pgp_sym_encrypt`) |
| Blind Hash | SHA-256 `digest()` para búsquedas exactas |
| Anti-XSS | Helmet + escape de salidas |
| Anti-SQLi | Drizzle ORM (parametrización obligatoria) |
| CORS | whitelist de orígenes conocidos |
| HTTPS/TLS | Forzado (Vercel + Neon) |
| Auditoría | Tabla WORM con triggers AFTER ROW |

## Flujo de Autenticación

```
1. Usuario envía credentials + Turnstile token
2. Rate limit check (IP + email)
3. Lockout check (5 intentos fallidos → 30 min bloqueo)
4. Argon2id verify (con dummy hash anti-user-enumeration)
5. Generar Access Token (JWT, 15 min) + Refresh Token (7 días)
6. Refresh Token almacenado en DB (hasheado)
7. Log de auditoría (éxito o fallo)
8. MFA check (si habilitado, pedir código TOTP)
```

## Protecciones

### Anti-User-Enumeration
- Mensaje genérico: "Credenciales inválidas"
- Dummy hash Argon2id cuando el usuario no existe
- Tiempo de respuesta constante

### Rate Limiting
- Login: 10 intentos por IP cada 15 min
- API general: 100 req/min por IP
- Endpoints sensibles: 20 req/min

### Columnas Cifradas (pgcrypto)
- `clients.phone` → `pgp_sym_encrypt(phone, key)`
- `clients.email` → `pgp_sym_encrypt(email, key)`
- `colaboradores.phone` → `pgp_sym_encrypt(phone, key)`

### Hash Determinístico
- `clients.phone_hash bytea UNIQUE` → `digest(phone, 'sha256')`
- Permite `WHERE phone_hash = digest(?, 'sha256')` sin desencriptar
