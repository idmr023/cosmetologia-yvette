# Web Performance Optimization (WPO)

## Estrategias

### 1. Lazy Loading de Componentes

```typescript
// src/components/landing/Gallery.tsx — ya debería usar lazy
const GallerySection = dynamic(() => import('@/components/landing/Gallery'), {
  loading: () => <GallerySkeleton />,
});
```

### 2. Optimización de Imágenes

- Usar `next/image` con WebP y sizes definidos
- Implementar `priority` en hero image
- Usar `placeholder="blur"` con blurDataURL

### 3. Caching Estratégico

```typescript
// Backend: cache headers en respuestas públicas
app.get('/api/services', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  // ...
});
```

### 4. Code Splitting

- Grupos de rutas en Next.js ya separan por defecto
- Asegurar `dynamic imports` para modales y formularios pesados

### 5. Compresión

- `compression` middleware en Express ya debería estar (o agregarlo)

```bash
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

### 6. Bundle Analysis

```bash
npm install @next/bundle-analyzer
# Configurar en next.config.mjs
# Ejecutar: ANALYZE=true npm run build
```

## Métricas Before / After

| Métrica | Antes | Después | Herramienta |
|---------|-------|---------|-------------|
| LCP (Largest Contentful Paint) | | | Lighthouse |
| FID (First Input Delay) | | | Lighthouse |
| CLS (Cumulative Layout Shift) | | | Lighthouse |
| TTI (Time to Interactive) | | | Lighthouse |
| Tamaño bundle JS | | | bundle-analyzer |
| Tamaño primera carga | | | DevTools |

## Ejecución

```bash
# Lighthouse CI local
npx lighthouse http://localhost:3000 --view

# Análisis de bundle
ANALYZE=true npm run build
```
