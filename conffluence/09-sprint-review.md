h1. 09 — Sprint Review

h2. Formato de la ceremonia

La Sprint Review se realiza *cada 4 semanas*, al final del Sprint. Duración: *45 minutos*.

h3. Participantes

- *PO* (desarrollador) — presenta resultados, acepta/rechaza
- *SM* (mentora externa) — facilita la sesión, registra feedback
- *Stakeholders invitados* — Yvette (dueña), Elizabeth/Lourdes (colaboradoras) según disponibilidad y pertinencia

h3. Agenda

1. *Check-in* (5 min): recordatorio del Sprint Goal
2. *Demo en vivo* (25 min):
   - El Dev muestra el incremento funcionando en entorno real (localhost + Neon)
   - Se recorren las historias del Sprint Backlog una por una
   - Los stakeholders interactúan con la funcionalidad (si aplica)
3. *Feedback* (10 min): PO y stakeholders expresan observaciones
4. *Actualización del Product Backlog* (5 min): se registran nuevos insights como historias o ajustes

h3. Criterios de aceptación

|| Criterio || Quién decide ||
| ¿La funcionalidad es usable desde mobile? | PO + stakeholders |
| ¿Resuelve el problema de negocio planteado en la User Story? | PO |
| ¿La UX es intuitiva sin entrenamiento previo? | Stakeholders |
| ¿El código pasa el DoD? | Dev (verificado durante el Sprint) |

h3. Historia de aceptación — ejemplos

*Sprint 02 — Aceptado*: Booking público

{quote}
Yvette probó la reserva: "Pude agendar un corte con Elizabeth sin registrar. Solo puse mi nombre y teléfono. Esto ahorra las llamadas de ida y vuelta." — *Aceptado* ✅
{quote}

*Sprint 05 — Rechazado parcialmente*: Caja chica

{quote}
"En el celular se ve bien pero los botones son muy pequeños, casi toco el equivocado." — *Rechazado*, touch targets < 44px. Pasó al Sprint 06 con corrección. ✅ resuelto.
{quote}

*Sprint 08 — Aceptado*: Fidelización

{quote}
Elizabeth vio su nivel: "Soy Oro con 520 puntos. Ahora en la recepción pregunto si quiere canjear su descuento." — *Aceptado* ✅
{quote}

h3. Sprint Goal alcanzado — registro por Sprint

|| Sprint || Goal alcanzado || Feedback clave ||
| 01 | ✅ | "La landing se ve profesional, me gusta el dorado" — Yvette |
| 02 | ✅ | "Reservar sin login es justo lo que necesito" — Yvette |
| 03 | ✅ | Panel colaborador listo para Elizabeth y Lourdes |
| 04 | ✅ (con deuda) | Backend migrado, 1 test falla — pasa a Sprint 05 |
| 05 | ✅ | Caja funciona en mobile después de fix touch targets |
| 06 | ✅ | MFA configurado para admin |
| 07 | ⚠️ Parcial | Slots picker OK, notificaciones WhatsApp pendientes de API key |
| 08 | ✅ | Fidelización completa con 3 niveles, referidos OK |
| 09 | ✅ (con deuda) | E-commerce sin pasarela real (solo registro de pago) |
| 10 | ✅ | E2E cubren flujos críticos, CI verde |
| 11 | ✅ | Docs completas, Sentry integrado |
| 12 | ✅ | Cierre, cero defectos abiertos |
