# PWS Peliquería — Centro de Estética Yvette

## Documentación
Antes de modificar cualquier código, leer los docs relevantes en `docs/`:
- `docs/ARCHITECTURE.md` — estructura general, stack, principios
- `docs/COMPONENTS.md` — sistema de componentes, patrones de UI
- `docs/API.md` — endpoints REST, autenticación, filtros
- `docs/DATABASE.md` — schema, tablas, índices, RLS
- `docs/SECURITY.md` — autenticación, cifrado, rate limiting
- `docs/CHANGELOG.md` — cambios recientes y versiones

## Negocio
- Centro de Estética Yvette, Cercado de Lima. RUC 10107822564. Activo desde 13/02/2005.
- 3 colaboradoras fijas: Elizabeth (989187417), Lourdes (989284171), Yvette (991697726, fundadora).
- Roles: `admin`, `colaborador`, `cliente`.
- Servicios válidos: ver `src/lib/seed/services.ts`. No inventar nombres de servicios.

## Stack
- Frontend: Next.js 14 App Router + TypeScript strict.
- Backend: Express + TypeScript (en `backend/`).
- Tailwind CSS mobile-first (breakpoints `sm`/`md`/`lg`).
- Drizzle ORM + Neon (PostgreSQL serverless). **NO Supabase.**
- NextAuth.js para autenticación frontend.
- Zustand para estado de cliente.
- react-hook-form + zod para formularios.
- framer-motion para swipe/animaciones.
- lucide-react para iconos.

## UI/UX Mobile-First (obligatorio)
- Landing **responsive real**: mobile + desktop. NUNCA mobile-only.
- Panel admin/colaborador: móvil = experiencia principal; desktop = sidebar lateral.
- **Prohibido `<table>`** en vistas. Usar cards apiladas (`flex flex-col gap-3`).
- Touch targets mínimo 44x44px.
- Texto base `16px` (`text-base`) para evitar auto-zoom iOS.
- `BottomNav` fija `< md`; `SideNav` lateral `≥ md`. Máx 5 ítems.
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
- **ANTES de crear un componente, verificar si ya existe uno reutilizable en `src/components/ui/`:**
  - `LoadingSpinner` — spinner dorado centrado
  - `EmptyState` — card con mensaje vacío
  - `InfoCard` — card con icono dorado + fondo gold/5
  - `SectionRow` — link con card, icono, texto y chevron
  - `Card` — card base con borde redondeado
  - `Badge` — badge con variantes de color
  - `Button` — botón con variantes primary/secondary/outline/ghost/danger
  - `Input` — input con label y error
  - `DataCard` — card con header, badges, menú 3 puntos
  - `Sheet` — drawer/sheet modal
  - `ThreeDotMenu` — menú de 3 puntos

## Comandos
- `npm run dev` — servidor frontend (Next.js).
- `npm run dev:backend` — servidor backend (Express, en `backend/`).
- `npm run dev:all` — frontend + backend simultáneo (requiere `concurrently`).
- `npm run build` — build producción.
- `npm run lint` — ESLint.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run db:push` — aplicar schema a Neon.
- `npm run db:studio` — Drizzle Studio.
- `npm run test` — Vitest.
- `npm run test:e2e` — Playwright (chromium, 19 spec files).
- `npm run test:e2e:ui` — Playwright UI mode.
- `npm run test:e2e:debug` — Playwright debug mode.
- `npm run test:e2e:seed` — Sembrar datos de prueba e2e.
- No commitear sin pasar `npm run lint && npm run typecheck`.

## Backend (Express en `backend/`)
- `cd backend && npm run dev` — inicia Express en puerto 4000.
- En desarrollo, Next.js redirige `/api/*` a Express via rewrites.
- En producción, desplegar backend separadamente (Railway, Render, etc.).
- Variables de entorno: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` en `backend/.env`.
- Las API routes de Next.js (`src/app/api/`) son el fallback para producción serverless.

## PWA / Offline
- Service Worker en `public/sw.js`. Registro automático en producción.
- `RegisterSW` component en layout raíz.
- Cache API: `idb-keyval` con TTL 5 min en `src/lib/idbCache.ts`.
- Sync queue: `src/stores/syncStore.ts` — mutaciones offline encoladas hasta reconexión.
- `NetworkStatus` badge en AppShell para todas las rutas autenticadas.
- `manifest.json` con iconos SVG personalizados.

## codebase-memory-mcp
- Prefiere `search_graph` / `trace_path` / `get_code_snippet` sobre `grep`/`glob` para descubrir código.
- Reindexar tras cambios estructurales con `index_repository` (modo `moderate`).
