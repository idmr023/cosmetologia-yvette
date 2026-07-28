h1. 10 — Sprint Retrospective

h2. Formato

Cada Sprint finaliza con una retrospectiva de 30 minutos. Formato *Start / Stop / Continue*:

- *Start*: prácticas que el equipo debería comenzar a hacer
- *Stop*: prácticas que el equipo debería dejar de hacer
- *Continue*: prácticas que funcionan y deben mantenerse

h2. Retrospectivas por Sprint

h3. Sprint 01 — "Primeros pasos"

{quote}
"Configurar Drizzle + Neon me tomó más de lo esperado."
{quote}

|| Start || Stop || Continue ||
| Documentar setup de BD desde el inicio | Postergar la configuración de CI | Commits tempranos y frecuentes |
| Usar {{.env.example}} con defaults | | |

*Actions*:
- Crear {{scripts/setup.sh}} con comandos de inicialización
- Configurar CI en GitHub Actions desde el Sprint 02

h3. Sprint 02 — "La BD legacy"

{quote}
"Descubrimos que la BD tenía tablas Laravel de un proyecto anterior."
{quote}

|| Start || Stop || Continue ||
| Verificar estado de la BD antes del Sprint Planning | Asumir que la BD está limpia | Hacer la migración manual con script tsx |
| Script de {{db:check}} que liste tablas y columnas | | |

*Actions*:
- {{drizzle-kit push}} no funciona con tablas legacy → script de migración manual
- Agregar {{verify-db.ts}} para diagnóstico rápido

h3. Sprint 03 — "Hydration y webpack"

{quote}
"Las páginas admin mostraban hydration mismatch. Era la cache de Next.js."
{quote}

|| Start || Stop || Continue ||
| Limpiar {{.next/}} en CI antes del build | Ignorar warnings de consola en desarrollo | Desarrollar mobile-first (funciona en desktop sin ajustes) |
| Agregar {{clean: true}} en next.config.mjs | | |

*Actions*:
- Configurar Next.js para limpiar cache en cada build

h3. Sprint 04 — "Refactor sin romper"

{quote}
"Separar el backend de Next.js fue riesgoso. Los rewrites de dev ayudaron."
{quote}

|| Start || Stop || Continue ||
| Pruebas manuales post-refactor con Postman | Hacer refactors grandes sin PR intermedio | Usar repository pattern desde el inicio |
| Documentar contratos de API en docs/API.md | | |

*Actions*:
- Documentar todos los endpoints REST antes del Sprint 05

h3. Sprint 05 — "Touch targets"

{quote}
"Yvette dijo: 'los botones son muy pequeños'. Touch targets mínimos de 44px."
{quote}

|| Start || Stop || Continue ||
| Probar en dispositivo físico antes del Review | Asumir que emulador mobile = real | El feedback directo de la dueña mejora el producto |
| Usar {{min-h-touch}} (44px) como clase utilitaria | | |

*Actions*:
- Crear clase {{min-h-touch: 44px}} en Tailwind config

h3. Sprint 06 — "Shadow DOM y JWT"

{quote}
"La migración de bcrypt a argon2 rompió el login de NextAuth. El fallback solo usaba bcrypt."
{quote}

|| Start || Stop || Continue ||
| Verificar compatibilidad de hash antes de migrar | Migrar hashes en producción sin rollback | tryMigrateToArgon2 en login exitoso (no en lote) |
| Agregar test de autenticación en E2E | | |

*Actions*:
- Sincronizar {{verifyPassword}} entre backend y NextAuth fallback
- Agregar E2E test de login

h3. Sprint 07 — "Slots y notificaciones"

{quote}
"El time slot picker fue más complejo de lo estimado. Las notificaciones dependen de API externa."
{quote}

|| Start || Stop || Continue ||
| Tener API keys listas antes del Sprint | Depender de servicios externos sin plan B | El slot picker en tiempo real funciona con Drizzle |
| Mock de servicios externos en desarrollo | | |

*Actions*:
- Crear mock de ultramsg para desarrollo
- Algoritmo de slots: validar con datos reales de Yvette

h3. Sprint 08 — "Fidelización end-to-end"

{quote}
"El programa de fidelización abarcó 7 tablas nuevas. La migración fue limpia."
{quote}

|| Start || Stop || Continue ||
|| Separar seed de datos de prueba vs producción || Mezclar seed de desarrollo con seed de producción || Seed idempotente con {{onConflictDoNothing()}} ||

*Actions*:
- Crear {{scripts/seed-e2e.ts}} para datos de prueba E2E

h3. Sprint 09 — "E-commerce contra el tiempo"

{quote}
"El checkout multi-step se hizo en los últimos días. Quedó bien pero sin pasarela real."
{quote}

|| Start || Stop || Continue ||
|| Priorizar features core sobre integraciones externas || Subestimar el tiempo de integración de pagos || División en pasos (datos → entrega → pago → resumen) ||

*Actions*:
- Queda pendiente integración con Mercado Pago para producción real
- El registro de pago manual (Yape/Plin/Efectivo) es suficiente para MVP

h3. Sprint 10 — "Playwright verde"

{quote}
"Migrar 16 specs de Cypress a Playwright tomó un Sprint completo."
{quote}

|| Start || Stop || Continue ||
| Usar {{globalSetup}} para auth E2E | Escribir tests sin seed de datos dedicado | E2E cubren flujos críticos completos |
| Paralelizar E2E en CI | | |

*Actions*:
- CI pasa en 8 min con 4 workers
- Turnstile bypass con test keys

h3. Sprint 11 — "Documentar o morir"

{quote}
"8 secciones de documentación técnica. Sentry + metrics integrados."
{quote}

|| Start || Stop || Continue ||
|| Escribir documentación junto con el código || Dejar docs para el final || ADRs (Architecture Decision Records) ||

*Actions*:
- Docs cubren arquitectura, API, BD, seguridad, performance, monitoreo, HA, testing

h3. Sprint 12 — "Cierre"

{quote}
"Último Sprint. Cero defectos abiertos. 248 de 249 pts completados."
{quote}

|| Start || Stop || Continue ||
| Planificar mantenimiento post-entrega | Agregar features nuevas en el último Sprint | El proceso SCRUM adaptado funcionó para 1 dev |
| Preparar demo final con stakeholders | | |

*Actions*:
- Release v0.4.0 preparada
- Pendiente: deploy a producción (Railway / Vercel)

h2. Resumen de acciones implementadas

|| # || Acción || Sprint origen || Estado ||
| 1 | Script de migración manual (SQL directo) | 02 | ✅ |
| 2 | {{verify-db.ts}} para diagnóstico | 02 | ✅ |
| 3 | {{clean: true}} en Next.js config | 03 | ✅ |
| 4 | Documentación de API REST | 04 | ✅ |
| 5 | {{min-h-touch}} 44px en Tailwind | 05 | ✅ |
| 6 | {{tryMigrateToArgon2}} en login exitoso | 06 | ✅ |
| 7 | Mock de ultramsg en desarrollo | 07 | ✅ |
| 8 | {{scripts/seed-e2e.ts}} separado | 08 | ✅ |
| 9 | Global setup de auth en Playwright | 10 | ✅ |
| 10 | ADRs en codebase-memory-mcp | 11 | ✅ |
