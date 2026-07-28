# PWS Peliquería — Centro de Estética Yvette

Web App de gestión integral para el **Centro de Estética Yvette** (Cercado de Lima). Sistema completo con auto-agendamiento público, panel administrativo, e-commerce, programa de fidelización, y bot de Telegram con IA.

## Stack

| Capa | Tecnologías |
|------|------------|
| **Frontend** | Next.js 14 App Router · TypeScript strict · Tailwind CSS mobile-first · Framer Motion · Lucide |
| **Backend** | Express · TypeScript · Drizzle ORM · Neon (PostgreSQL serverless) |
| **Auth** | NextAuth.js (frontend) + JWT + Refresh Tokens + MFA/TOTP + OAuth Google |
| **State** | Zustand (cliente) + React Query (server state) |
| **Forms** | react-hook-form + zod |
| **Charts** | Recharts (dashboard analítico) |
| **PDF/QR** | jsPDF + html2canvas + qrcode + html5-qrcode |
| **Bot/IA** | Telegraf (Telegram) + Gemini 2.5 Flash (Google GenAI) |
| **Monitoreo** | Sentry · Pino · prom-client |
| **Testing** | Vitest + Testing Library (frontend) · Jest + Supertest (backend) · Playwright (e2e, 19 specs) |
| **CI/CD** | GitHub Actions (lint → typecheck → test → build → e2e) |

## Features

- **Auto-agendamiento público** — Calendario de 2 semanas con slots disponibles, selección de servicios y colaboradora
- **Panel Admin** — Citas, clientes, servicios, colaboradores, inventario, cajas, comisiones, reportes, analítica, fidelización, reseñas, auditoría, notificaciones, configuración
- **Panel Colaborador** — Mis citas, apertura/cierre de caja, escaneo QR, perfil
- **Panel Cliente** — Historial de citas, reseñas, canje de puntos
- **E-commerce** — Tienda online con carrito persistente (Zustand + localStorage) y checkout
- **Programa de Fidelización** — Niveles Bronce/Plata/Oro, puntos por S/1.00, descuentos y recompensas
- **Reseñas** — Valoración post-cita con 5 estrellas, moderación admin, sección pública
- **Dashboard Analítico** — KPIs, ingresos diarios, heatmap horario, servicios/colaboradoras top
- **Notificaciones** — Confirmación wa.me, recordatorios 24h, solicitud de reseña, alertas de stock bajo
- **Telegram Bot + IA** — Consulta de citas, stock y servicios vía Gemini 2.5 Flash con function calling
- **PWA/Offline** — Service Worker, caché con idb-keyval, cola de sincronización offline

## Setup

```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL, NEXTAUTH_SECRET, etc.
cd backend && npm install && cp .env.example .env  # completar vars del backend
cd ..

npm run db:push               # aplicar schema a Neon
npm run seed                  # sembrar datos de prueba

npm run dev:all               # frontend (3000) + backend (4000) simultáneo
```

### Variables de Entorno

#### Root (`.env.local`)
| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a Neon PostgreSQL |
| `NEXTAUTH_SECRET` | Secreto de NextAuth.js |
| `NEXTAUTH_URL` | URL del frontend (http://localhost:3000) |
| `JWT_SECRET` | Secreto JWT access tokens |
| `JWT_REFRESH_SECRET` | Secreto JWT refresh tokens |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `GOOGLE_CLIENT_ID` | OAuth Google Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth Google Client Secret |
| `SENTRY_DSN` | DSN de Sentry (opcional) |

#### Backend (`backend/.env`)
| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a Neon PostgreSQL |
| `JWT_SECRET` | Secreto JWT access tokens |
| `JWT_REFRESH_SECRET` | Secreto JWT refresh tokens |
| `CORS_ORIGIN` | Origen permitido (http://localhost:3000) |
| `PORT` | Puerto (4000) |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `GEMINI_API_KEY` | API key de Google Gemini |
| `SENTRY_DSN` | DSN de Sentry (opcional) |

## Comandos

```bash
npm run dev          # Frontend (Next.js)
npm run dev:backend  # Backend (Express)
npm run dev:all      # Ambos simultáneo

npm run build        # Build producción frontend
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit

npm run db:push      # Aplicar schema a Neon
npm run db:generate  # Generar migración
npm run db:studio    # Drizzle Studio

npm run seed         # Sembrar datos de prueba

npm run test         # Vitest (frontend)
npm run test:e2e     # Playwright (19 spec files)
```

## Arquitectura

```
┌────────────────────────────────────────────┐
│              Cliente (Browser)              │
│  Next.js 14 · Tailwind · Zustand · Framer  │
└─────────────────────┬──────────────────────┘
                      │ HTTP REST
┌─────────────────────▼──────────────────────┐
│        API Gateway (Express + Node)         │
│  JWT Auth · Rate Limit · RLS · Metrics     │
│  Circuit Breaker · Retry · Sentry · Pino   │
├─────────────────────┬──────────────────────┤
│  Repositories (DAO) │  Services (lógica)   │
└─────────────────────┼──────────────────────┘
                      │ Drizzle ORM
┌─────────────────────▼──────────────────────┐
│          PostgreSQL (Neon Serverless)       │
│  RLS · pgcrypto · Triggers · Audit WORM   │
└────────────────────────────────────────────┘
```

### Grupos de Ruta

| Grupo | Prefijo | Acceso |
|-------|---------|--------|
| `(public)` | `/` | Público |
| `(auth)` | `/login`, `/registro`, `/recuperar` | Público |
| `(app)` | `/admin/*`, `/colaborador/*`, `/cliente/*` | Autenticado |

## Testing

- **Unit tests (frontend):** `npm run test` — Vitest + Testing Library
- **Unit tests (backend):** `cd backend && npm run test` — Jest + Supertest
- **E2E tests:** `npm run test:e2e` — Playwright (19 spec files, Desktop Chrome + Pixel 5)
- **Seed E2E:** `npm run test:e2e:seed` — Datos de prueba para e2e

Los tests e2e requieren frontend + backend corriendo. Playwright los inicia automáticamente.

## Licencia

Propietario — Centro de Estética Yvette. RUC 10107822564.
