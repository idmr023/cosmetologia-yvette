h1. 03 — Product Backlog

h2. Backlog priorizado (Épicas + User Stories)

Las historias están priorizadas por valor de negocio + riesgo técnico. Escala Fibonacci: 1, 2, 3, 5, 8, 13, 21.

h3. Épica 1: Landing y presencia web (Prioridad: Crítico)

|| ID || User Story || Pts ||
| US-001 | Como visitante, quiero ver una landing informativa con servicios, galería y CTA, para decidir agendar una cita | 5 |
| US-002 | Como administrador, quiero que la landing sea mobile-first y responsive, para captar clientes desde celular | 3 |
| US-003 | Como visitante, quiero ver reseñas de clientes en la landing, para confiar en el servicio antes de reservar | 5 |

h3. Épica 2: Autenticación y seguridad (Prioridad: Crítico)

|| ID || User Story || Pts ||
| US-004 | Como administrador, quiero iniciar sesión con email + password, para acceder al panel de gestión | 8 |
| US-005 | Como administrador, quiero protección contra fuerza bruta (rate limit + lockout), para evitar accesos no autorizados | 5 |
| US-006 | Como administrador, quiero poder usar Google OAuth, para iniciar sesión sin credenciales adicionales | 5 |
| US-007 | Como administrador, quiero MFA/TOTP opcional, para proteger mi cuenta ante robo de contraseña | 8 |
| US-008 | Como administrador, quiero que las contraseñas se almacenen con Argon2id, para cumplir estándares OWASP | 3 |

h3. Épica 3: Booking público (Prioridad: Alta)

|| ID || User Story || Pts ||
| US-009 | Como cliente, quiero reservar una cita online sin registro, eligiendo servicio, colaboradora y horario | 13 |
| US-010 | Como cliente, quiero ver solo slots disponibles en tiempo real, para no elegir horarios ocupados | 8 |
| US-011 | Como cliente, quiero recibir confirmación por WhatsApp, para tener mi cita registrada | 5 |
| US-012 | Como administrador, quiero que se genere una boleta única B{YYYYMMDD}-{ID} por cita, para tracking interno | 3 |

h3. Épica 4: Panel administrativo (Prioridad: Alta)

|| ID || User Story || Pts ||
| US-013 | Como administrador, quiero un dashboard con KPIs (ingresos, citas, ocupación), para monitorear el negocio | 13 |
| US-014 | Como administrador, quiero CRUD de citas con filtros, para gestionar la agenda diaria | 8 |
| US-015 | Como administrador, quiero CRUD de clientes con historial, para tener perfil completo de cada cliente | 8 |
| US-016 | Como administrador, quiero CRUD de inventario (insumos + productos venta), para controlar stock | 8 |
| US-017 | Como administrador, quiero reportes de comisiones por colaboradora, para liquidar pagos | 5 |
| US-018 | Como administrador, quiero apertura y cierre de caja diaria, para cuadrar ingresos | 8 |

h3. Épica 5: Refactor Backend Express (Prioridad: Alta)

|| ID || User Story || Pts ||
| US-019 | Como desarrollador, quiero separar backend a Express, para tener una API independiente de Next.js | 13 |
| US-020 | Como desarrollador, quiero usar Repository Pattern (DAO), para separar lógica de negocio de BD | 8 |
| US-021 | Como desarrollador, quiero middleware JWT + rate-limit + Helmet + CORS, para seguridad en capas | 8 |
| US-022 | Como desarrollador, quiero circuit-breaker + retry pattern, para resiliencia ante fallos de BD | 5 |

h3. Épica 6: Fidelización y reseñas (Prioridad: Media)

|| ID || User Story || Pts ||
| US-023 | Como cliente, quiero acumular puntos por cada cita, para canjear descuentos en servicios | 8 |
| US-024 | Como cliente, quiero subir de nivel (Bronce/Plata/Oro), para obtener mejores beneficios | 5 |
| US-025 | Como administrador, quiero gestionar recompensas y niveles, para motivar la recurrencia | 5 |
| US-026 | Como cliente, quiero dejar una reseña post-cita, para compartir mi experiencia | 5 |
| US-027 | Como administrador, quiero moderar reseñas, para mantener la reputación del centro | 3 |
| US-028 | Como cliente, quiero recomendar el centro con código de referido, para obtener descuento en mi próxima visita | 5 |

h3. Épica 7: E-commerce (Prioridad: Media)

|| ID || User Story || Pts ||
| US-029 | Como cliente, quiero ver productos en venta con stock, para comprar online | 8 |
| US-030 | Como cliente, quiero agregar productos a un carrito, para revisar antes de pagar | 5 |
| US-031 | Como cliente, quiero checkout con datos de envío y método de pago, para completar mi compra | 8 |
| US-032 | Como administrador, quiero recibir pedidos con estado, para preparar entregas | 5 |
| US-033 | Como cliente, quiero ver el estado de mi orden, para saber cuándo recogerla | 3 |

h3. Épica 8: Testing y documentación (Prioridad: Alta)

|| ID || User Story || Pts ||
| US-034 | Como desarrollador, quiero E2E tests con Playwright, para asegurar flujos críticos en CI | 13 |
| US-035 | Como administrador, quiero un sistema de monitoreo (Sentry + métricas), para detectar errores en producción | 8 |
| US-036 | Como desarrollador, quiero documentación de arquitectura y API, para mantener el proyecto | 5 |
| US-037 | Como desarrollador, quiero PWA con service worker, para que la app funcione offline parcialmente | 8 |

h3. Resumen de backlog

|| Épica || Historias || Total Story Points ||
| Landing | 3 | 13 |
| Autenticación | 5 | 29 |
| Booking | 4 | 29 |
| Panel admin | 6 | 50 |
| Refactor backend | 4 | 34 |
| Fidelización | 6 | 31 |
| E-commerce | 5 | 29 |
| Testing + docs | 4 | 34 |
| *Total* | *37* | *249* |
