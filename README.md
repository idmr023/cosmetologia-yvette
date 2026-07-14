# PWS Peliquería — Centro de Estética Yvette

Web App de gestión integral para el Centro de Estética Yvette (Cercado de Lima).

## Stack
Next.js 14 · TypeScript · Tailwind (mobile-first) · Drizzle ORM · Neon (PostgreSQL) · NextAuth · Zustand

## Setup
```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL y NEXTAUTH_SECRET
npm run db:push              # aplicar schema a Neon
npm run dev
```

## Estructura
- `src/app/(public)` — landing responsive
- `src/app/(auth)` — login/registro
- `src/app/(app)` — panel admin/colaborador/cliente (mobile-first)
- `src/components` — UI (ui/, navigation/, cards/, forms/, landing/)
- `src/hooks` — lógica de negocio (acceso a BD)
- `src/lib` — schema, db, auth, utils
- `src/stores` — Zustand

Ver `AGENTS.md` para convenciones completas.
