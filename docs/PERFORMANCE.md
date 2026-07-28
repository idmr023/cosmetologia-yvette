# Evaluación de Rendimiento (ISO 25010)

## Estrategia

### Herramienta: k6 (Grafana k6)

Alternativa ligera a JMeter, scripteable en JavaScript, ideal para CI/CD.

### Instalación

```bash
# Windows (winget)
winget install k6

# macOS
brew install k6

# Linux
sudo apt install k6
```

### Scripts de prueba

Ubicación propuesta: `tests/performance/`

#### 1. Smoke Test — verificar funcionamiento básico

```javascript
// tests/performance/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:4000/api/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

#### 2. Load Test — carga sostenida

| Parámetro | Valor |
|-----------|-------|
| Virtual Users (VUs) | 50 |
| Duración | 5 min |
| Escenario | Lectura (GET /api/appointments/public) |

```javascript
// tests/performance/load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 50 },  // Sostenido
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests bajo 500ms
    http_req_failed: ['rate<0.01'],    // <1% errores
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/appointments/public?limit=20');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'duration < 300ms': (r) => r.timings.duration < 300,
  });
  sleep(1);
}
```

#### 3. Stress Test — llevar al límite

```javascript
// tests/performance/stress.js
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 0 },
  ],
};
```

### Ejecución

```bash
k6 run tests/performance/smoke.js
k6 run tests/performance/load.js
k6 run tests/performance/stress.js
```

### Umbrales/SLA propuestos

| Métrica | Objetivo | Alerta |
|---------|----------|--------|
| Tiempo de respuesta p95 | < 500ms | > 1s |
| Tiempo de respuesta p99 | < 1s | > 2s |
| Tasa de error | < 1% | > 5% |
| Throughput (peticiones/segundo) | > 100 rps | < 50 rps |
| CPU (backend) | < 70% | > 85% |
| RAM (backend) | < 200MB | > 400MB |

### Reporte

Para el informe (Sección 16 del Anexo):

1. Descripción del entorno: CPU, RAM, SO, Node versión, conexión Neon
2. Métricas evaluadas: latencia, throughput, errores
3. Herramienta: k6 v0.x
4. Resultados: tabla comparativa vs umbrales
5. Gráficos: importar de k6 HTML report (`k6 run --out html=report.html`)
6. Cuellos de botella identificados
7. Conclusiones y acciones de mejora
