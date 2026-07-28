# Alta Disponibilidad y Recuperación ante Desastres

## Estrategia

### Arquitectura Actual

```
Browser → Vercel (Next.js) ← API → Railway/Render (Express) → Neon (PostgreSQL)
```

### Puntos Únicos de Falla

| Componente | Riesgo | Mitigación |
|------------|--------|------------|
| Express server | Caída del proceso | PM2 / Docker restart policy |
| Neon DB | Caída regional | Neon HA read replicas |
| JWT Secret | Pérdida del secreto | Backup en Doppler / 1Password |
| API Gateway | Sin redundancia | Escalar horizontalmente |

## Health Checks

### Endpoint Actual

```http
GET /api/health
→ { status: "ok", timestamp: "2026-07-22T..." }
```

### Mejora: Health Check Detallado

```typescript
// backend/src/routes/health.ts
GET /api/health/detailed
→ {
    status: "ok",
    uptime: 3600,
    database: "connected",
    memory: { used: 150, total: 512, percent: 29.3 },
    cpu: { load1: 0.5, load5: 0.3, load15: 0.2 },
    version: "0.2.0"
  }
```

## Conexión a Base de Datos

### Connection Pooling (Neon)

Neon soporta hasta 10,000 conexiones, pero recomienda usar pooler:

```typescript
// backend/src/lib/db.ts — configurar pool
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

### Read Replicas (Neon)

Neon ofrece read replicas automáticas. Usar para queries de solo lectura:

```typescript
// queries de lectura
const dbRead = drizzle(neon(process.env.DATABASE_URL_READ_ONLY));
// queries de escritura
const dbWrite = drizzle(neon(process.env.DATABASE_URL));
```

## Graceful Shutdown

```typescript
// backend/src/index.ts
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});
```

## Escenarios de Prueba (para Sección 20 del Anexo)

### Escenario 1: Caída del Servidor Express
1. Matar proceso Express (`kill -9`)
2. Medir tiempo hasta que PM2 lo reinicia
3. Objetivo: RTO < 30s

### Escenario 2: Pérdida de Conexión a BD
1. Detener Neon (simulado)
2. Verificar que Express maneja el error gracefulmente
3. Medir recuperación al reconectar

### Escenario 3: Pico de Tráfico
1. Ejecutar stress test (k6 con 200 VUs)
2. Verificar rate limiting y circuit breaker
3. Medir degradación vs caída total

## Entorno de Pruebas

### Alma Linux VM (según rúbrica)

```bash
# Crear VM con Vagrant
Vagrantfile:
  config.vm.box = "almalinux/9"
  config.vm.network "forwarded_port", guest: 4000, host: 4000
  config.vm.provision "shell", inline: <<-SHELL
    dnf install -y nodejs npm
  SHELL
```

## Métricas de Recuperación

| Métrica | Objetivo | Real |
|---------|----------|------|
| RTO (Recovery Time Objective) | < 5 min | — |
| RPO (Recovery Point Objective) | < 1 min | — |
| Uptime mensual | 99.9% | — |
| Tiempo de failover BD | < 30s | — |
