h1. 12 — Incremento: Release Notes

h2. v0.1.0 — MVP (Sprints 01-03)

*Fecha de release*: Fin Sprint 03 (Año 1, Mes 3)

h3. Nuevo
- Landing page responsiva (Hero, About, Services, Gallery, CTA, Footer)
- Booking público: selección de servicio → colaboradora → fecha/hora → datos del cliente
- Panel admin: dashboard con citas del día, CRUD de citas, clientes, servicios
- Panel colaborador: mis citas, perfil
- Autenticación con NextAuth.js + bcrypt
- Seed con 1 admin (Yvette), 3 colaboradoras (Elizabeth, Lourdes), 26 servicios
- Base de datos con Drizzle ORM + Neon PostgreSQL (10 tablas iniciales)

h3. Technical
- Mobile-first Tailwind CSS
- next.config.mjs con rewrites para API

----

h2. v0.2.0 — Refactor + Seguridad (Sprints 04-06)

*Fecha de release*: Fin Sprint 06 (Año 1, Mes 6)

h3. Nuevo
- Backend Express Gateway independiente en {{backend/}}
- Repository Pattern (7 DAOs: appointment, client, colaborador, commission, inventory, cashRegister, service)
- Stack de middleware: JWT auth, rate-limit, Helmet, CORS, errorHandler
- Argon2id con migración automática desde bcrypt en login exitoso
- Refresh tokens con rotación (Access 15min + Refresh 7d)
- MFA/TOTP opcional con otplib + QR code
- Google OAuth
- Módulo de caja: apertura, cierre, gastos, diferencia
- Módulo de comisiones por colaboradora
- Row Level Security en 5 tablas transaccionales
- Auditoría WORM (Write-Once, Read-Many) con triggers AFTER ROW caputrando JSONB de OLD/NEW
- Rate limiting por endpoint

h3. Technical
- {{npm run dev:all}} para frontend + backend simultáneo
- GitHub Actions CI (lint → typecheck → build)
- Jest + Supertest configurado (2 suites iniciales)
- Circuit breaker + retry pattern en {{backend/src/lib/resilience.ts}}
- Endpoint de métricas en {{/api/metrics}}
- pgcrypto para column-level encryption

----

h2. v0.3.0 — Features de negocio (Sprints 07-09)

*Fecha de release*: Fin Sprint 09 (Año 2, Mes 3)

h3. Nuevo
- Auto-agendamiento mejorado con time slot picker (2 semanas vista, slots en tiempo real)
- Boleta única B{YYYYMMDD}-{ID} por cita
- Notificaciones multicanal: WhatsApp (ultramsg), recordatorios 24h antes, confirmaciones post-cita
- *Programa de fidelización*:
  - 3 niveles: Bronce (0pts), Plata (200pts, 5% desc), Oro (500pts, 10% desc + cumpleaños gratis)
  - 1 punto por S/ 1.00 gastado
  - Recompensas canjeables desde el LoyaltyCard del cliente
  - Referidos con código único (10% desc para el referidor)
  - 7 nuevas tablas: {{loyalty_tiers}}, {{loyalty_points}}, {{loyalty_transactions}}, {{loyalty_rewards}}, {{client_rewards}}, {{referral_codes}}, {{referral_usage}}
- *Reseñas*: rating 1-5, comentario, moderación admin, sección pública en landing
- *Dashboard analítico*: KPIs (ingresos, citas, clientes nuevos, ocupación), heatmap por hora, servicios top, colaboradoras top, variación % vs período anterior
- *E-commerce*:
  - Catálogo público con filtro por categoría y stock
  - Carrito persistente (Zustand + localStorage)
  - Checkout multi-step (datos → entrega → pago → resumen → confirmación)
  - Tracking de órdenes: {{GET /orden/[id]}} pública
  - Tablas {{orders}}, {{order_items}} con seguimiento de estado

h3. Changed
- SideNav y MobileMenuGrid actualizados con 3 nuevas rutas (Analítica, Fidelización, Reseñas)
- {{navConfig.ts}} con 13 items desktop, 5 mobile
- {{PageShell}} unifica layout admin
- {{FilterChips<T>}} genérico para búsqueda y filtros

----

h2. v0.4.0 — Testing, documentación y cierre (Sprints 10-12)

*Fecha de release*: Fin Sprint 12 (Año 2, Mes 12)

h3. Nuevo
- *Playwright E2E*: 16 spec files cubriendo flujos públicos (landing, reservar, tienda, review), admin (dashboard, citas, clientes, analitica, fidelizacion, resenas, inventario, comisiones, colaboradores, reportes) y colaborador (mis-citas, cajas)
- *CI/CD*: GitHub Actions con 3 jobs (frontend typecheck+lint+build, backend typecheck+test, E2E)
- *PWA*: Service Worker en {{public/sw.js}}, RegisterSW en layout raíz, cache API con {{idb-keyval}} (TTL 5 min), sync queue offline con Zustand
- *Documentación técnica*: 8 secciones en {{docs/}} (arquitectura, componentes, API, BD, seguridad, performance, monitoreo, HA, testing usability)
- *Monitoreo*: Sentry para errores, middleware de métricas con Prometheus, Pino para logging estructurado, Clinic.js para profiling
- *Health checks* y graceful shutdown

h3. Fixed
- Hydration mismatches en panel admin (webpack cache)
- Login lockout por {{login_attempts}} acumulados
- Touch targets < 44px en caja (corregido con {{min-h-touch}})
- Tipo de hash incompatible entre bcrypt y argon2 (migración controlada)

h3. Technical Debt
- 248/249 story points completados (99.6%)
- 0 defectos abiertos al cierre
- TypeScript strict mode sin errores
- ESLint 0 errores

----

h2. Resumen general del proyecto

|| Métrica || Valor ||
| Duración total | 2 años (12 sprints de 4 semanas) |
| Story Points completados | 248/249 (99.6%) |
| Releases | 4 (v0.1.0 → v0.4.0) |
| Archivos TypeScript | 190+ |
| Tablas BD | 28 |
| Rutas API backend | 17 módulos |
| Repositorios DAO | 7 |
| Hooks frontend | 12 |
| Stores Zustand | 4 |
| Páginas frontend | 32 (8 públicas + 20 admin + 4 colaborador) |
| Tests E2E | 16 specs (Playwright) |
| Documentación técnica | 8 secciones + 12 páginas SCRUM |
| CI | GitHub Actions (3 jobs, ~8 min) |
