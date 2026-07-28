# Monitoreo de la Aplicación

## Stack Propuesto

| Capa | Herramienta | Propósito |
|------|-------------|-----------|
| Logs estructurados | Pino (reemplazar morgan) | Logs JSON con request ID, timing, errores |
| Métricas de aplicación | Express + prom-client | Endpoint `/api/metrics` con métricas Prometheus |
| Métricas de sistema | `os` module + node-os-utils | CPU, RAM, disco, red del servidor |
| Dashboards | Grafana (opcional) | Visualización de métricas |
| Error tracking | Sentry (ya implementado) | Stack traces, breadcrumbs |
| Code profiling | 0x / Clinic.js | Perfilamiento de CPU y memory leaks |
| Uptime monitoring | Uptime Robot / Better Uptime | Health check externo |

## Métricas a recolectar

### Sistema (servidor Express)
- CPU usage (%)
- Memoria RAM (used / total)
- Disco (used / total)
- Tiempo de actividad (uptime)
- Conexiones activas

### Aplicación (endpoints)
- Tiempo de respuesta por endpoint (p50, p95, p99)
- Tasa de requests por segundo
- Tasa de error por endpoint
- Requests activos concurrentes

### Base de datos (Neon)
- Conexiones activas / disponibles
- Tiempo de query promedio
- Tasa de error de queries

### Negocio
- Citas creadas/hora
- Clientes nuevos/día
- Ingresos/día

## Implementación

### middleware/metrics.ts — Métricas Prometheus

```typescript
// backend/src/middleware/metrics.ts
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000],
  registers: [register],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(duration);
    httpRequestsTotal.labels(req.method, route, String(res.statusCode)).inc();
  });
  next();
}

export function metricsEndpoint(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
}

export { register };
```

### Ruta de métricas

```typescript
// En backend/src/index.ts
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics';

app.use('/api', metricsMiddleware); // Mide todos los endpoints
app.get('/api/metrics', metricsEndpoint);
```

### Monitoreo de sistema

```typescript
// backend/src/lib/systemMonitor.ts
import os from 'os';

export function getSystemMetrics() {
  return {
    cpu: os.loadavg(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
    },
    uptime: os.uptime(),
    platform: os.platform(),
    nodeVersion: process.version,
  };
}
```

## Logs Estructurados (Pino)

```bash
npm install pino
```

```typescript
// backend/src/lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: ['req.headers.authorization', 'req.body.password'],
});

export default logger;
```

## Perfilamiento de Código

```bash
# Clinic.js — perfilamiento visual
npm install -g clinic
clinic doctor -- node backend/dist/index.js

# 0x — flamegraphs
npm install -g 0x
0x backend/dist/index.js
```

## Alertas

| Evento | Acción |
|--------|--------|
| CPU > 85% | Notificar a admin |
| Tasa error > 5% en 5 min | Revisar Sentry |
| Endpoint caído | Verificar health |
| Disco > 90% | Hacer backup y limpiar |

## Dashboard

Para la evidencia del informe (Sección 18 del Anexo):
1. Captura de `GET /api/metrics` en formato texto
2. Exportar dashboard Grafana (si se implementa)
3. Captura de Sentry Performance
4. Logs de Pino con filtro de errores
