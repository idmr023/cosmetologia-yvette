h1. Sprint 09 — Dashboard analítico + E-commerce

*Release*: v0.3.0 | *Período*: Semana 33–36 (Año 2) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Dotar al admin de inteligencia de negocio y habilitar ventas online
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-029 | Catálogo de productos con stock | 8 | ✅ |
| US-030 | Carrito de compras persistente | 5 | ✅ |
| US-031 | Checkout multi-step | 8 | ✅ |
| US-032 | Admin recibe pedidos con estado | 5 | ✅ |
| US-033 | Cliente ve estado de su orden | 3 | ✅ |
| TSK-011 | Dashboard analítico con KPIs, heatmap, variación % | 8 | ✅ |
| *Total* | | *37* | *✅* (capacity: 32, completed: 31) |

h2. Daily highlights

- D1–D5: Dashboard analítico: ingresos, citas, clientes nuevos, ocupación, heatmap horario, servicios top, variación %
- D6–D10: E-commerce: catálogo con filtro por categoría, stock disponible
- D11–D14: Carrito Zustand + localStorage persistente
- D15–D18: Checkout multi-step (datos → entrega → pago → resumen → confirmación)
- D19–D20: Tracking público de orden. Tablas orders + order_items

h2. Sprint Review outcome

{quote}
✅ *Aceptado con deuda*: E-commerce sin pasarela de pago real (solo registro Yape/Plin/Efectivo)
{quote}

h2. Retrospective actions

- *Start*: Priorizar features core sobre integraciones externas
- *Stop*: Subestimar integración de pagos
- Queda pendiente Mercado Pago para producción real
