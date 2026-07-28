# Pruebas de Usabilidad

## Stack

| Herramienta | Propósito |
|-------------|-----------|
| Playwright | Automatización de navegador para flujos críticos |
| Lighthouse CI | Core Web Vitals y métricas de usabilidad |
| axe-core | Pruebas de accesibilidad |

## Playwright — Pruebas de Flujo

### Instalación

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Configuración

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'Mobile Chrome', use: { browserName: 'chromium', viewport: { width: 375, height: 812 } } },
  ],
});
```

### Flujos a Automatizar

#### 1. Flujo de Reserva Pública
```typescript
// e2e/public-booking.spec.ts
test('cliente reserva cita desde landing', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Reservar cita');
  await page.click('text=Corte de cabello');
  await page.click('text=Elizabeth');
  await page.fill('input[type="datetime-local"]', '2026-07-25T10:00');
  await page.click('text=En salón');
  await page.fill('input[name="name"]', 'María Pérez');
  await page.fill('input[name="phone"]', '999888777');
  await page.click('text=Confirmar cita');
  await expect(page.locator('text=Reserva confirmada')).toBeVisible();
});
```

#### 2. Login y Gestión de Citas (Admin)
```typescript
// e2e/admin-appointments.spec.ts
test('admin crea cita manualmente', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@yvette.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('text=Iniciar sesión');
  await page.click('text=Citas');
  await page.click('text=Nueva cita');
  // ...
});
```

#### 3. Mobile — Navegación y BottomNav
```typescript
// e2e/mobile-navigation.spec.ts
test('navegación móvil funciona', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');
  // Credenciales...
  await page.click('text=Clientes');
  await expect(page).toHaveURL(/.*clientes/);
});
```

## Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run dev',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
```

## Checklist ISO 25010 — Usabilidad

| Sub-característica | Evidencia requerida | Métrica |
|--------------------|--------------------|---------|
| Facilidad de aprendizaje | Tiempo en completar tarea por nuevo usuario | < 3 min |
| Protección contra errores | Validaciones en formularios, mensajes de error | Sin errores no manejados |
| Asistencia al usuario | Tooltips, placeholders, mensajes de ayuda | Cobertura > 80% |
| Compromiso del usuario | Tasa de abandono, retención | < 30% abandono en registro |

## Reporte

Para el informe (Sección 14 del Anexo):
1. Playwright test results (HTML report)
2. Lighthouse scores (performance, accessibility, best practices, SEO)
3. Capturas de pantalla de flujos críticos
4. Métricas de usabilidad recopiladas
