# PWS Peliquería — Centro de Estética Yvette

## Documentación
Antes de modificar cualquier código, leer los docs relevantes en `docs/`:
- `docs/ARCHITECTURE.md` — estructura general, stack, principios
- `docs/COMPONENTS.md` — sistema de componentes, patrones de UI
- `docs/API.md` — endpoints REST, autenticación, filtros
- `docs/DATABASE.md` — schema, tablas, índices, RLS
- `docs/SECURITY.md` — autenticación, cifrado, rate limiting
- `docs/PERFORMANCE.md` — load testing con k6, SLA
- `docs/MONITORING.md` — Sentry, Pino, Prometheus, Clinic.js
- `docs/HIGH_AVAILABILITY.md` — HA, health checks, DR scenarios
- `docs/WPO.md` — optimización de rendimiento web
- `docs/SECURITY_TESTING.md` — OWASP ZAP, vulnerabilidades
- `docs/USABILITY_TESTING.md` — pruebas de usabilidad ISO 25010
- `docs/CHANGELOG.md` — cambios recientes y versiones

## Negocio
- Centro de Estética Yvette, Cercado de Lima. RUC 10107822564. Activo desde 13/02/2005.
- 3 colaboradoras fijas: Elizabeth (989187417), Lourdes (989284171), Yvette (991697726, fundadora).
- Roles: `admin`, `colaborador`, `cliente`.
- Servicios válidos: ver `src/lib/seed/services.ts`. No inventar nombres de servicios.

## Stack
- **Frontend:** Next.js 14 App Router + TypeScript strict.
- **Backend:** Express + TypeScript (en `backend/`).
- **UI:** Tailwind CSS mobile-first (breakpoints `sm`/`md`/`lg`).
- **ORM:** Drizzle ORM + Neon (PostgreSQL serverless). **NO Supabase.**
- **Auth:** NextAuth.js (frontend) + JWT + Refresh Tokens (backend).
- **State:** Zustand (cliente), React Query (@tanstack/react-query, server state).
- **Forms:** react-hook-form + zod para validación.
- **Animaciones:** framer-motion para swipe/animaciones.
- **Iconos:** lucide-react.
- **Monitoreo:** Sentry (errores), Pino (logging), prom-client (métricas Express).
- **IA:** Google Gemini 2.5 Flash via @google/genai (Telegram bot).
- **Bot:** Telegraf (Telegram bot para consultas internas).
- **Charts:** Recharts (dashboard analítico).
- **PDF:** jsPDF + html2canvas (boletas/reportes).
- **QR:** html5-qrcode + qrcode (lector/generador QR).
- **Testing:** Vitest + Testing Library (frontend), Jest + Supertest (backend), Playwright (e2e, 19 spec files).
- **CI/CD:** GitHub Actions (lint → typecheck → test → build → e2e).

## UI/UX Mobile-First (obligatorio)
- Landing **responsive real**: mobile + desktop. NUNCA mobile-only.
- Panel admin/colaborador: móvil = experiencia principal; desktop = sidebar lateral.
- **Prohibido `<table>`** en vistas. Usar cards apiladas (`flex flex-col gap-3`).
- Touch targets mínimo 44x44px.
- Texto base `16px` (`text-base`) para evitar auto-zoom iOS.
- `BottomNav` fija `< md`; `SideNav` lateral `≥ md`. Máx 5 ítems + "Más" grid.
- Editar/eliminar: menú 3 puntos o swipe (framer-motion).
- Búsqueda/filtros: chips scrollables (`overflow-x-auto`).

## Estética
- Paleta: blanco `#FFFFFF`, negro `#0A0A0A`, dorado `#C9A227`, pastel `#F5E6D3`.
- Profesional, minimalista, elegante. Sin emojis en UI salvo requisito explícito.

## Convenciones de código
- Componentes: PascalCase, un componente por archivo (`ClientCard.tsx`).
- Hooks: `useXxx.ts`. Utils: camelCase.
- Props de componente con `interface`, no `type`.
- Helpers de formato/validación en `src/lib/utils.ts`.
- Sin comentarios salvo lógica no obvia.
- Nunca loggear secretos/tokens/passwords.
- `.env.local` fuera de git. Prefijo `NEXT_PUBLIC_` solo si se expone al cliente.
- **ANTES de crear un componente, verificar si ya existe uno reutilizable:**
  - `src/components/ui/` (o `primitives/`): `Button`, `Input`, `Card`, `Badge`, `DataCard`, `CardSkeleton`, `EmptyState`, `PageShell`, `FilterChips`, `ConfirmDialog`, `ThreeDotMenu`, `Sheet`, `Toast`, `SectionRow`, `InfoCard`, `LoadingSpinner`
  - `src/components/cards/`: `AppointmentCard`, `ClientCard`, `ColaboradorCard`, `InventoryCard`
  - `src/components/modals/`: `AppointmentForm`, `ClientForm`, `ColaboradorForm`, `ServiceForm`, `InventoryForm`, `ConfirmDelete`, `ClientHistoryModal`, `MobileMenuGrid`
  - `src/components/navigation/`: `TopBar`, `SideNav`, `BottomNav`, `navConfig`
  - `src/components/cash/`: `OpenCashRegister`, `CloseCashRegister`, `CashStatusBar`, `AddExpense`
  - `src/components/landing/`: `Header`, `Hero`, `Services`, `About`, `Gallery`, `CTA`, `Footer`
  - `src/components/loyalty/`: `LoyaltyCard`
  - `src/components/reviews/`: `ReviewSection`, `ReviewForm`, `ReviewCard`

## Hooks disponibles
- `useCrud` — hook genérico CRUD (base para los demás)
- `useAppointments` — useCrud("/api/appointments") + lógica extra
- `useClients` — useCrud("/api/clients") + search
- `useServices` — useCrud("/api/services") + categories
- `useColaboradores` — useCrud("/api/colaboradores")
- `useInventory` — useCrud("/api/inventory") + lowStock
- `useCommissions` — useCrud("/api/commissions")
- `useReports` — hook específico de reportes
- `useCashRegister` — hook específico de caja
- `useClientHistory` — hook específico de historial
- `useColaboradorCalendar` — hook específico de calendario
- `useFormSheet` — hook para manejar sheet + form + save

## Stores (Zustand)
- `authStore` — token, refreshToken, role, user
- `cartStore` — carrito de compras (persistente con localStorage)
- `syncStore` — mutaciones offline encoladas hasta reconexión
- `uiStore` — tema, sidebar, preferencias

## Comandos
- `npm run dev` — servidor frontend (Next.js).
- `npm run dev:backend` — servidor backend (Express, en `backend/`).
- `npm run dev:all` — frontend + backend simultáneo (requiere `concurrently`).
- `npm run build` — build producción.
- `npm run lint` — ESLint.
- `npm run typecheck` — `tsc --noEmit`.
- `cd backend && npm run db:push` — aplicar schema a Neon (requiere TTY, usar `db:apply` como alternativa).
- `npm run db:generate` — generar migración.
- `npm run db:studio` — Drizzle Studio.
- `npm run seed` — sembrar datos de prueba.
- `npm run test` — Vitest (frontend).
- `npm run test:watch` — Vitest watch mode.
- `npm run test:e2e` — Playwright (19 spec files).
- `npm run test:e2e:ui` — Playwright UI mode.
- `npm run test:e2e:debug` — Playwright debug mode.
- `npm run test:e2e:seed` — Sembrar datos de prueba e2e.
- No commitear sin pasar `npm run lint && npm run typecheck`.

## Backend (Express en `backend/`)
- `cd backend && npm run dev` — inicia Express en puerto 4000.
- `cd backend && npm run db:apply` — aplica migraciones pendientes sin TTY (reemplaza `db:push` para entornos no interactivos).
- `cd backend && npm run db:sync` — `generate` + `apply` en un solo paso.
- En desarrollo, Next.js redirige `/api/*` a Express via rewrites.
- En producción, desplegar backend separadamente (Railway, Render, etc.).
- Variables de entorno: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `SENTRY_DSN`, `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY` en `backend/.env`.
- Las API routes de Next.js (`src/app/api/`) son el fallback para producción serverless.

### Middleware stack
- Helmet (seguridad HTTP headers)
- CORS (whitelist de orígenes)
- express.json()
- Pino HTTP (logging estructurado)
- Metrics (prom-client: contadores, latencia p50/p95/p99)
- Rate limiting (por endpoint: authLimiter, apiLimiter, publicLimiter)
- Sentry error tracking
- Error handler centralizado

### Routes (17 módulos)
`auth`, `appointments`, `clients`, `services`, `colaboradores`, `inventory`, `commissions`, `cashRegisters`, `reports`, `settings`, `mfa`, `telegram`, `loyalty`, `reviews`, `notifications`, `products`, `orders`, `audit`

### Repository Pattern (DAO)
- 7 repositories en `backend/src/repositories/`: appointment, client, colaborador, service, inventory, commission, cashRegister
- Servicios reciben repositorios por constructor (inyección de dependencias)

### Resiliencia
- `CircuitBreaker` (implementación propia en `backend/src/lib/resilience.ts`): estados closed/open/half-open
- `retry` con backoff exponencial (3 intentos)
- Graceful shutdown (SIGTERM/SIGINT)

### Métricas
- Endpoint `GET /api/metrics` con contadores HTTP, latencia (avg/p50/p95/p99), memoria Node.js, errores por código
- Endpoint `GET /api/health` con status + timestamp

## PWA / Offline
- Service Worker en `public/sw.js`. Registro automático en producción.
- `RegisterSW` component en layout raíz.
- Cache API: `idb-keyval` con TTL 5 min en `src/lib/idbCache.ts`.
- Sync queue: `src/stores/syncStore.ts` — mutaciones offline encoladas hasta reconexión.
- `NetworkStatus` badge en AppShell para todas las rutas autenticadas.
- `manifest.json` con iconos SVG personalizados.

## Telegram Bot + Gemini AI
- **Bot**: Telegraf en `backend/src/telegram/bot.ts`. Rate limiting (15 msg/min/usuario) + whitelist por userId.
- **Modo polling** en desarrollo, **webhook** en producción (POST `/api/telegram/webhook`).
- **Gemini Agent**: `backend/src/telegram/geminiAgent.ts` con Google GenAI SDK.
  - Modelo: `gemini-2.5-flash`
  - System instruction personalizada para contexto del centro de estética
  - Function calling: `consultarStock`, `consultarCitas`, `consultarServicios`
  - Herramientas: `backend/src/telegram/tools/stockTools.ts`, `appointmentTools.ts`, `serviceTools.ts`
  - Historial de conversación en memoria
  - Formato de salida HTML para Telegram

## Seguridad
- **Hashing**: Argon2id (migrado desde bcrypt, re-hash automático en login)
- **Auth**: JWT (Access 15min + Refresh 7d httpOnly, con rotación)
- **MFA**: TOTP (otplib + Google Authenticator), endpoints `/api/auth/mfa/setup`, `/verify`, `/validate`, `/status`
- **OAuth**: Google Login (manteniendo credentials)
- **Rate Limiting**: express-rate-limit + LRU cache, por endpoint (authLimiter, apiLimiter, publicLimiter)
- **Captcha**: Cloudflare Turnstile
- **Row Security**: PostgreSQL RLS + `current_setting('app.tenant_id')`
- **Column Encryption**: pgcrypto AES-256 (`pgp_sym_encrypt`) en teléfono y email
- **Blind Hash**: SHA-256 `digest()` para búsquedas exactas
- **Anti-XSS**: Helmet + escape de salidas
- **Anti-SQLi**: Drizzle ORM (parametrización obligatoria)
- **Auditoría**: Tabla `audit_logs` WORM con triggers AFTER ROW

## Optimización de Tokens (para asistentes LLM)
- **Lazy init DB**: `src/lib/db.ts` usa `getDb()` lazy para evitar ejecutar `neon()` en build time
- **Sliding window**: El agente Gemini mantiene solo últimos 6 mensajes de conversación
- **Caching**: idb-keyval con TTL 5 min para respuestas API en frontend
- **React Query**: staleTime de 2 min en consultas para reducir fetching redundante
- **Compresión**: compression middleware en Express para reducir payload ~70%
- **Code Splitting**: dynamic imports para modales y componentes pesados

## codebase-memory-mcp
- Prefiere `search_graph` / `trace_path` / `get_code_snippet` sobre `grep`/`glob` para descubrir código.
- Reindexar tras cambios estructurales con `index_repository` (modo `moderate`).
