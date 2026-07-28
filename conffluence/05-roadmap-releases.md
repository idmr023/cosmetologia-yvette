h1. 05 — Roadmap de 2 años y Releases

h2. Timeline

{code}
Año 1 ───────────────────────────────────────────────────────────
Q1 (Sprints 01-03)          Q2-Q3 (Sprints 04-06)         Q4 (Sprints 07-09)     
┌────────────────────┐      ┌────────────────────┐        ┌────────────────────┐
│  v0.1.0 — MVP      │      │  v0.2.0 — Refactor │        │  v0.2.0 — Security │
│                     │      │  + Backend Express │        │  + Features        │
│ Landing             │      │                    │        │                    │
│ Booking público     │─ ─ ─ │ Express Gateway    │─ ─ ─  │ Argon2id + JWT     │
│ Auth bcrypt         │      │ Repository Pattern │        │ MFA/TOTP + OAuth   │
│ Panel admin base    │      │ Middleware stack   │        │ RLS + Audit WORM   │
│ Seed + Schema Driz. │      │ Cash registers    │        │ Notificaciones     │
└────────────────────┘      └────────────────────┘        └────────────────────┘
  Ene - Mar                     Abr - Sep                     Oct - Dic

Año 2 ───────────────────────────────────────────────────────────
Q1-Q2 (Sprints 07-09)        Q3 (Sprints 10-11)          Q4 (Sprint 12)        
┌────────────────────┐      ┌────────────────────┐        ┌────────────────────┐
│  v0.3.0 — Features │      │  v0.4.0 — Testing  │        │  v0.4.0 — Cierre   │
│                     │      │  + Documentación   │        │                    │
│ Auto-agendamiento   │      │                    │        │ Bug fixes          │
│ Fidelización        │─ ─ ─ │ Playwright E2E     │─ ─ ─  │ Performance tuning │
│ Dashboard analítico │      │ CI GitHub Actions  │        │ Final release      │
│ Reseñas             │      │ Docs informe final │        │ Demo final         │
│ E-commerce          │      │ Monitoring + HA    │        │                    │
└────────────────────┘      └────────────────────┘        └────────────────────┘
  Ene - Jun                     Jul - Oct                     Nov - Dic
{code}

h2. Releases

h3. v0.1.0 — MVP (Sprints 01-03)

Lanzamiento inicial del sistema. Cubre el core del negocio: agenda digital, registro de clientes y servicios.

*Incremento*: Página pública con landing y booking multi-step (servicio → colaboradora → fecha/hora → datos). Panel admin con CRUD de citas, clientes, servicios. Panel colaborador con mis citas y perfil. Autenticación con NextAuth + bcrypt. Seed de 3 colaboradoras, 1 admin y 26 servicios.

h3. v0.2.0 — Refactor + Seguridad (Sprints 04-06)

Separación de la API en un backend Express independiente. Refuerzo de seguridad integral.

*Incremento*: API Gateway Express con 10 rutas REST. Repository pattern (7 DAOs). Middleware stack: JWT, rate-limit, Helmet, CORS. Argon2id con migración automática desde bcrypt. Refresh tokens con rotación. MFA/TOTP opcional. Google OAuth. Row Level Security en 5 tablas. Auditoría WORM con triggers AFTER ROW. Módulo de caja (apertura/cierre/gastos). Comisiones por colaboradora.

h3. v0.3.0 — Features de negocio (Sprints 07-09)

Funcionalidades avanzadas que agregan valor diferenciador al centro de estética.

*Incremento*: Auto-agendamiento con time slot picker en tiempo real. Boleta única B{YYYYMMDD}-{ID}. Notificaciones multicanal (WhatsApp ultramsg, recordatorios 24h). Programa de fidelización con 3 niveles (Bronce/Plata/Oro), puntos y referidos. Módulo de reseñas con rating 1-5 y moderación. Dashboard analítico con KPIs, heatmap y variación porcentual. E-commerce: catálogo, carrito Zustand, checkout multi-step, tracking de órdenes.

h3. v0.4.0 — Testing, documentación y cierre (Sprints 10-12)

Aseguramiento de calidad y preparación para entrega final.

*Incremento*: 16 E2E specs con Playwright (chromium, mobile emulation). CI con GitHub Actions (typecheck + lint + build + E2E). Documentación técnica completa (8 secciones: arquitectura, API, BD, seguridad, performance, monitoreo, HA, testing). PWA con service worker + sync queue offline. Circuit breaker + retry pattern. Bug fixes finales y performance tuning.
