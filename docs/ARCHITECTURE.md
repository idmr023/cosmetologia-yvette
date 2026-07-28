# Arquitectura del Sistema

## Visión General

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (Browser)                      │
│  Next.js 14 App Router · Tailwind · Zustand · Framer     │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP REST
┌──────────────────────────▼──────────────────────────────┐
│              API Gateway (Express + Node.js)              │
│  JWT Auth · Rate Limit · RLS · Audit · Circuit Breaker  │
├──────────────────────────┬──────────────────────────────┤
│     Repositories (DAO)   │   Services (Business Logic)  │
└──────────────────────────┼──────────────────────────────┘
                           │ Drizzle ORM
┌──────────────────────────▼──────────────────────────────┐
│              PostgreSQL (Neon Serverless)                 │
│  RLS · pgcrypto · Triggers · Audit Ledger · Partitioning│
└─────────────────────────────────────────────────────────┘
```

## Grupos de Ruta (Frontend)

| Grupo | Prefijo | Acceso | Layout |
|-------|---------|--------|--------|
| `(public)` | `/` | Público | Header + Footer |
| `(auth)` | `/login`, `/registro`, `/recuperar` | Público | Centered card |
| `(app)` | `/admin/*`, `/colaborador/*` | Autenticado | SideNav + BottomNav |

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript strict, Tailwind CSS
- **Backend:** Express, TypeScript, Drizzle ORM
- **DB:** Neon (PostgreSQL serverless), pgcrypto, RLS
- **Auth:** NextAuth.js (frontend), JWT + Refresh Tokens (backend)
- **State:** Zustand (client), React Query (server state, planned)
- **Testing:** Vitest, Testing Library, Supertest, Cypress

## Principios

1. **Server Components por defecto** — solo `"use client"` cuando hay estado/eventos
2. **UI separada de lógica** — componentes NO llaman a la BD
3. **Repository pattern** — toda query pasa por `src/repositories/`
4. **Inyección de dependencias** — servicios reciben repositorios por constructor
5. **CQRS tácito** — lecturas por un lado, escrituras por otro
