h1. 06 — Sprint Planning

h2. Formato de la ceremonia

La Sprint Planning se realiza *cada 4 semanas*, al inicio del Sprint, con duración de *60 minutos*. Participan el PO (+Dev) y el SM.

h3. Agenda

1. *Análisis de capacidad* (10 min): el SM revisa la velocity histórica, el Dev confirma disponibilidad del período
2. *Revisión del Product Backlog* (15 min): el PO presenta las historias top del backlog priorizado, el SM verifica que estén refinadas
3. *Estimación* (20 min): el Dev estima las historias candidatas usando Planning Poker. Escala Fibonacci (1, 2, 3, 5, 8, 13, 21)
4. *Sprint Goal* (10 min): se define el objetivo único del Sprint (Sprint Goal)
5. *Commitment* (5 min): se seleccionan las historias que caben en la capacidad del Sprint, se registran en el Sprint Backlog

h3. Capacidad del Sprint

|| Sprint || Días hábiles || Focus factor || Capacidad (pts) ||
| 01–03 (early) | 20 | 60% | ~18 pts |
| 04–08 (steady) | 20 | 80% | ~25 pts |
| 09–11 (peak) | 20 | 90% | ~32 pts |
| 12 (cierre) | 20 | 70% | ~22 pts |

*Focus factor menor al inicio por curva de aprendizaje del stack (Next.js, Drizzle, Neon).*

h3. Planning Poker (adaptación solitaria)

Al ser 1 Dev, la estimación se hace en 2 rondas:

1. *Primera ronda*: el Dev estima sin consultar referencias, registra su número en secreto
2. *Segunda ronda*: si la estimación difiere > 2 niveles de Fibonacci del Sprint anterior similar, se discute con el SM y se re-estima

Esto evita el sesgo de "siempre 8" y fuerza una reflexión realista.

h3. Sprint Goal — ejemplos

|| Sprint || Sprint Goal ||
| Sprint 01 | "Establecer la base técnica y la presencia web del centro" |
| Sprint 04 | "Separar el backend en un servicio independiente sin romper funcionalidad existente" |
| Sprint 07 | "Permitir que los clientes se agenden sin intervención del staff" |
| Sprint 12 | "Cerrar deuda técnica y preparar el producto para entrega final" |
