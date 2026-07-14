# PWS Peliquería — Centro de Estética Yvette

## Negocio
- Centro de Estética Yvette, Cercado de Lima. RUC 10107822564. Activo desde 13/02/2005.
- 3 colaboradoras fijas: Elizabeth (989187417), Lourdes (989284171), Yvette (991697726, fundadora).
- Roles: `admin`, `colaborador`, `cliente`.
- Servicios válidos: ver `src/lib/seed/services.ts`. No inventar nombres de servicios.

## Stack
- Next.js 14 App Router + TypeScript (strict).
- Tailwind CSS mobile-first (breakpoints `sm`/`md`/`lg`).
- Drizzle ORM + Neon (PostgreSQL serverless). **NO Supabase.**
- NextAuth.js para autenticación.
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

## Arquitectura
- Separar UI (`src/components/`) de lógica (`src/hooks/`). Los componentes **NO** llaman a la BD directo.
- Hooks en `src/hooks/*` encapsulan acceso a datos (`useClients`, `useAppointments`, `useInventory`, `useAuth`).
- Server Components por defecto; `"use client"` solo cuando haya estado/eventos.
- Schema BD en `src/lib/schema.ts` (fuente única). Migraciones en `/drizzle`.
- Tipos derivados del schema (`Drizzle.inferSelect`/`inferInsert`). No duplicar tipos.
- Rutas protegidas por rol en `src/middleware.ts` + `AuthGuard`.
- Grupos de ruta: `(public)`, `(auth)`, `(app)`.

## Convenciones de código
- Componentes: PascalCase, un componente por archivo (`ClientCard.tsx`).
- Hooks: `useXxx.ts`. Utils: camelCase.
- Props de componente con `interface`, no `type`.
- Helpers de formato/validación en `src/lib/utils.ts`.
- Sin comentarios salvo lógica no obvia.
- Nunca loggear secretos/tokens/passwords.
- `.env.local` fuera de git. Prefijo `NEXT_PUBLIC_` solo si se expone al cliente.

## Comandos
- `npm run dev` — servidor desarrollo.
- `npm run build` — build producción.
- `npm run lint` — ESLint.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run db:push` — aplicar schema a Neon.
- `npm run db:studio` — Drizzle Studio.
- No commitear sin pasar `npm run lint && npm run typecheck`.

## codebase-memory-mcp
- Prefiere `search_graph` / `trace_path` / `get_code_snippet` sobre `grep`/`glob` para descubrir código.
- Reindexar tras cambios estructurales con `index_repository` (modo `moderate`).
