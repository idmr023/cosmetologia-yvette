# Pruebas de Seguridad

## Stack

| Herramienta | Propósito |
|-------------|-----------|
| OWASP ZAP | Escaneo automático de vulnerabilidades web |
| npm audit | Vulnerabilidades en dependencias |
| ESLint plugin security | Análisis estático de código |
| Helmet | Headers HTTP de seguridad (ya implementado) |

## OWASP ZAP

### Instalación

```bash
# Docker (recomendado para CI)
docker pull ghcr.io/zaproxy/zaproxy:stable

# O descargar de https://www.zaproxy.org/download/
```

### Escaneo Automatizado (CLI)

```bash
docker run -v $(pwd):/zap/wrk:rw -t ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
  -t http://host.docker.internal:4000 \
  -r report_seguridad.html
```

### Integración en CI (GitHub Actions)

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push]
jobs:
  zap_scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start backend
        run: |
          cd backend
          npm install
          npm run build
          npm start &
      - name: ZAP Scan
        uses: zaproxy/action-full-scan@v0.12.0
        with:
          target: 'http://localhost:4000'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
```

## Metodología (OWASP Top 10)

| Categoría | Prueba | Estado |
|-----------|--------|--------|
| A01 Broken Access Control | RBAC testing con diferentes roles | ✅ Implementado en auth middleware |
| A02 Cryptographic Failures | Verificar HTTPS, pgcrypto, Argon2id | ✅ Implementado |
| A03 Injection | Drizzle ORM previene SQLi | ✅ Por framework |
| A04 Insecure Design | Rate limiting, lockout | ✅ Implementado |
| A05 Security Misconfiguration | Helmet, CORS | ✅ Implementado |
| A06 Vulnerable Components | `npm audit` | 🟡 Ejecutar periódicamente |
| A07 Auth Failures | JWT refresh rotation, MFA | ✅ Implementado |
| A08 Data Integrity | WORM audit logs | ✅ Implementado |
| A09 Logging Failures | Sentry + auditoría | ✅ Implementado |
| A10 SSRF | Validación de URLs en webhooks | ❌ Pendiente |

## Vulnerabilidades Detectadas

| # | Vulnerabilidad | Severidad | Estado | Solución |
|---|---------------|-----------|--------|----------|
| — | Pendiente de ejecutar ZAP scan | — | ❌ | Ejecutar escaneo inicial |

## Acciones Correctivas

- Ejecutar ZAP scan tras cada deploy
- Configurar alertas de `npm audit` en CI
- Revisar dependencias obsoletas semanalmente

## Reporte

Para el informe (Sección 9.d del Anexo):
1. Captura de ZAP report (HTML)
2. Resumen de vulnerabilidades por severidad
3. Acciones correctivas implementadas
