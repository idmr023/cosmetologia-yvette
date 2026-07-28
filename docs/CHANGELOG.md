# Changelog

## [0.4.0] — Playwright E2E Testing

### Testing (nuevo)
- **Playwright**: Framework e2e instalado con `@playwright/test` y Chromium
- `playwright.config.ts` — 2 proyectos (Desktop Chrome + Mobile Pixel 5), webServer dual (frontend + backend), Turnstile test key
- `e2e/auth.setup.ts` — globalSetup que loguea admin + colaborador y persiste storageState
- `scripts/seed-e2e.ts` — seed de datos de prueba (admin, colaborador, servicios, inventario, citas pasadas/futuras, cliente)
- 19 spec files en `/e2e/`:
  - `public/` — landing, reservar, review, tienda (4 files, 10 tests)
  - `admin/` — dashboard, citas, clientes, analitica, fidelizacion, resenas, inventario, comisiones, colaboradores, reportes (10 files, 19 tests)
  - `colaborador/` — mis-citas, cajas (2 files, 4 tests)
- `.github/workflows/playwright.yml` — CI workflow con PostgreSQL service container

### Scripts
- `test:e2e` — `playwright test`
- `test:e2e:ui` — `playwright test --ui`
- `test:e2e:debug` — `playwright test --debug`
- `test:e2e:seed` — `tsx scripts/seed-e2e.ts`

### Infraestructura
- `e2e/storage/` en `.gitignore`
- `playwright-report/` y `test-results/` en `.gitignore`
- AGENTS.md actualizado con comandos e2e

## [0.2.0] — Refactorización Mayor + Backend Express

### Cambios Estructurales
- **Backend separado:** Express API Gateway en `backend/` independiente de Next.js (22 archivos)
- **Multi-Frontend:** Next.js consume API REST via hooks + proxy en desarrollo
- **Repository Pattern (DAO):** 7 repositories en `backend/src/repositories/`
- **Middleware stack:** JWT auth + rate-limit + Helmet + CORS + errorHandler
- **10 módulos de rutas Express** replicando contratos REST originales

### Frontend
- `npm run dev:backend` y `npm run dev:all` añadidos
- Dev proxy: `/api/*` → `localhost:4000` via rewrites de Next.js
- Producción: API routes de Next.js como fallback serverless

### Seguridad (Fase 4)
- **Argon2id**: Migración de bcrypt a argon2 en backend. Re-hash automático en login
- **Refresh Tokens**: Sistema de access token (15min) + refresh token (7d) con rotación. Tabla `refresh_tokens`
- **JWT Bearer**: Frontend envía token en headers `Authorization`. Auth store actualizada
- **MFA/TOTP**: Endpoints `/api/auth/mfa/setup`, `/verify`, `/validate`, `/status`. Otplib + QR code
- **OAuth Google**: GoogleProvider añadido a NextAuth
- **pgcrypto**: SQL migration con column-level encryption, blind SHA-256 hash, RLS policies
- **Rate Limiting**: Helmet + CORS + rate-limit ya en Express middleware stack

### Auditoría (Fase 5)
- Tabla `audit_logs` WORM (Write-Once, Read-Many) en schema Drizzle
- Triggers AFTER ROW con captura JSONB de OLD/NEW para appointments, clients, commissions, cash_registers, inventory
- SQL migrations con RLS habilitado en 5 tablas transaccionales

### Testing + Resiliencia (Fase 6)
- **Jest + Supertest**: Configurado en backend. 2 test suites iniciales
- **Circuit Breaker**: `opossum` wrapper en `backend/src/lib/resilience.ts`
- **Retry Pattern**: `async-retry` wrapper con 3 reintentos y backoff
- **GitHub Actions CI**: Workflow con frontend (typecheck+lint+build), backend (typecheck+test), E2E (Cypress)

### Infraestructura
- `backend/.env` con JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN, PORT=4000
- `backend/jest.config.ts` para TypeScript + Node
- `.github/workflows/ci.yml` con 3 jobs paralelos

### Componentes
- Nuevo sistema `DataCard` con slots (elimina duplicación en 7 cards)
- `PageShell` unifica layout de todas las páginas admin
- `FilterChips<T>` genérico reemplaza filtros inline
- `ConfirmDialog` unificado reemplaza overlays duplicados
- `useCrud` hook genérico reemplaza lógica CRUD repetida en 8 hooks
- `useFormSheet` encapsula patrón sheet + form + save

### Seguridad
- Migración de bcrypt a Argon2id
- JWT con refresh tokens (Access 15min + Refresh 7d)
- MFA/TOTP opcional por usuario
- OAuth Google Login
- Column-level encryption con pgcrypto (AES-256)
- Deterministic SHA-256 hash ciego para uniqueness

### Base de Datos
- Row Level Security habilitado
- Tabla `audit_logs` WORM (Write-Once, Read-Many)
- Triggers AFTER ROW con captura JSONB de OLD/NEW
- Particionamiento por rango en tablas de log
- Índices B-Tree estratégicos

### DevOps
- GitHub Actions CI (lint → typecheck → test → build)
- Preview deployments por PR
- Secrets management via Doppler

### Testing
- Backend: Jest + Supertest
- Frontend: Vitest + Testing Library
- E2E: Cypress (flujo crítico completo)

---

## [0.3.0] — Documentación, Resiliencia, Fidelización, E-commerce y Analítica

### Documentación del Proyecto (Fase Informe)
- `docs/REPORTE_INDICE.md`: 20 secciones del Anexo del informe final mapeadas al proyecto con estado (✅/🟡/❌)
- `docs/RUBRIC.md`: Criterios de evaluación traducidos a checklist técnico por cada criterio ISO 25010
- `docs/PERFORMANCE.md`: Estrategia de load testing con k6, umbrales SLA, scripts de smoke/load/stress
- `docs/MONITORING.md`: Stack de monitoreo (Prometheus, Pino, Sentry, Clinic.js), métricas del sistema y aplicación
- `docs/WPO.md`: Web Performance Optimization (lazy loading, caching, compresión, Core Web Vitals)
- `docs/HIGH_AVAILABILITY.md`: Plan de alta disponibilidad, health checks, graceful shutdown, escenarios de DR
- `docs/SECURITY_TESTING.md`: OWASP ZAP scan, integración CI, metodología OWASP Top 10
- `docs/USABILITY_TESTING.md`: Playwright, Lighthouse CI, checklist ISO 25010 usabilidad

### Resiliencia del Backend
- `backend/src/lib/resilience.ts`: Circuit Breaker con estados closed/open/half-open + patrón Retry con backoff exponencial
- Reemplaza dependencias no instaladas (opossum, async-retry) con implementación propia

### Monitoreo y Métricas
- `backend/src/middleware/metrics.ts`: Endpoint `/api/metrics` con contadores HTTP, latencia (avg/p50/p95/p99), memoria Node.js, errores por código
- Endpoint de health check mejorado en `/api/health`

### Feature 1 — Auto-agendamiento Público Mejorado
- `GET /api/appointments/available-slots?colaboradorId=&date=&serviceId=`: Nuevo endpoint que calcula slots disponibles en tiempo real considerando citas existentes, duración del servicio y horario laboral
- **Time slot picker**: Calendario de 2 semanas con selección de fecha y slots disponibles, reemplazando el datetime-local genérico
- **Flujo corregido**: Frontend y backend ahora usan schemas compatibles (clientName→firstName/lastName, serviceId→serviceIds[])
- **Boleta**: Generación de número de boleta único `B{YYYYMMDD}-{ID}` al crear cita

### Feature 2 — Notificaciones Multicanal
- `backend/src/routes/notifications.ts`: CRUD de notificaciones con filtros por tipo/estado
- `backend/src/lib/notifications.ts`: Servicio de notificaciones con soporte WhatsApp (ultramsg), recordatorios 24h antes, confirmaciones post-cita, solicitudes de reseña, alertas de stock bajo
- Tabla `notifications` con status tracking (pending→sent→failed)
- `src/lib/whatsapp.ts`: Plantillas de mensajes wa.me (confirmación, recordatorio, cambio de estado)

### Feature 3 — Programa de Fidelización
- **Nuevas tablas**: `loyalty_tiers` (Bronce/Plata/Oro), `loyalty_points`, `loyalty_transactions`, `loyalty_rewards`, `client_rewards`, `referral_codes`, `referral_usage`
- `backend/src/routes/loyalty.ts`: Endpoints para puntos, niveles, recompensas, canje y referidos
- **Asignación automática**: 1 punto por S/ 1.00 al completar cita, actualización de nivel automática
- **3 niveles**: Bronce (0pts), Plata (200pts, 5% desc), Oro (500pts, 10% desc + cumpleaños gratis)
- `src/components/loyalty/LoyaltyCard.tsx`: Widget visual con nivel, progreso, actividad y canje
- `src/app/(app)/admin/fidelizacion/page.tsx`: Panel admin para gestionar recompensas y ver niveles

### Feature 4 — Módulo de Reseñas y Valoraciones
- Tabla `reviews` con rating 1-5, comentario, visibilidad pública
- `backend/src/routes/reviews.ts`: CRUD con stats (promedio, total) y filtros
- `src/components/reviews/ReviewSection.tsx`: Sección en landing page con filtro por estrellas
- `src/components/reviews/ReviewForm.tsx`: Formulario post-cita con 5 estrellas + comentario
- `src/components/reviews/ReviewCard.tsx`: Card de reseña con diseño profesional
- `src/app/(public)/review/[appointmentId]/page.tsx`: Página pública para dejar reseña
- `src/app/(app)/admin/resenas/page.tsx`: Moderación de reseñas con stats y eliminación

### Feature 5 — Dashboard Analítico Inteligente
- `GET /api/reports/analytics?period=7d|30d|90d`: Nuevo endpoint con KPIs avanzados
- **KPIs**: Ingresos, citas, clientes nuevos, ocupación, variación vs período anterior
- **Gráficos**: Ingresos por día (barras), distribución horaria (heatmap), servicios top, colaboradoras top
- `src/app/(app)/admin/analitica/page.tsx`: Dashboard interactivo con filtro de período (7/30/90 días)
- Diferencias porcentuales con flechas up/down vs período anterior

### Feature 6 — Catálogo y E-commerce
- Tablas `orders` y `order_items` con seguimiento de estado (pendiente→pagado→enviado→entregado)
- `backend/src/routes/products.ts`: Catálogo público con filtro por categoría, stock disponible
- `backend/src/routes/orders.ts`: Creación de pedidos con validación de stock, decremento automático
- `src/stores/cartStore.ts`: Carrito persistente con Zustand + localStorage
- `src/app/(public)/tienda/page.tsx`: Tienda online con grid de productos, carrito drawer y checkout
- Header público actualizado con enlace "Tienda"

### Navegación y Admin
- SideNav y MobileMenuGrid actualizados con 3 nuevas rutas: Analítica, Fidelización, Reseñas
- `navConfig.ts`: 13 items en desktop nav, 5 en mobile nav (+ "Más" grid con todo)

### Schema BD — 11 nuevas tablas
`loyalty_tiers`, `loyalty_points`, `loyalty_transactions`, `loyalty_rewards`, `client_rewards`, `reviews`, `notifications`, `referral_codes`, `referral_usage`, `orders`, `order_items`

### Correcciones Técnicas
- TypeScript strict fixes en `appointmentRepository.ts` y `appointmentTools.ts` (tipos implícitos any)
- Template literals de SQL corregidos en appointments, loyalty, notifications que causaban errores de compilación
- Badge variants corregidas en admin pages
- Unique constraint en loyalty_points corregida (sintaxis Drizzle)

---

## [0.1.0] — Versión Inicial

- Sistema de booking público
- Panel admin (citas, clientes, servicios, colaboradores, inventario, comisiones, cajas, reportes)
- Panel colaborador (mis citas, escanear QR, cajas, perfil)
- Autenticación con NextAuth + bcrypt
- Rate limiting + lockout + Turnstile
- Landign page responsive
- Seed de datos (admin, 3 colaboradoras, 26 servicios)
