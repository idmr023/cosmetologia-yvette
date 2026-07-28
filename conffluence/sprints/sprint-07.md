h1. Sprint 07 — Auto-agendamiento + Notificaciones

*Release*: v0.3.0 | *Período*: Semana 25–28 (Año 2) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Permitir que los clientes se agenden sin intervención del staff
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-010 | Slots disponibles en tiempo real (no horarios ocupados) | 8 | ✅ |
| US-011 | Confirmación por WhatsApp | 5 | ⚠️ Parcial |
| US-012 | Boleta única B{YYYYMMDD}-{ID} por cita | 3 | ✅ |
| TSK-008 | Notificaciones multicanal (ultramsg, recordatorios 24h, alertas stock bajo) | 8 | ✅ |
| TSK-009 | Algoritmo de time slot picker (2 semanas vista, duración de servicio) | 6 | ✅ |
| *Total* | | *30* | *✅* (commit: 32, complete: 30) |

h2. Daily highlights

- D1–D8: Algoritmo de slots disponibles en backend. Endpoint {{GET /api/appointments/available-slots}}
- D9–D12: Frontend time slot picker con calendario de 2 semanas
- D13–D16: Servicio de notificaciones (ultramsg): confirmación, recordatorio 24h, post-cita
- D17–D20: *Impedimento*: API key de ultramsg no estaba lista → mock en desarrollo

h2. Sprint Review outcome

{quote}
⚠️ *Aceptado parcial*: Slots picker OK. Notificaciones WhatsApp pendientes de API key real
{quote}

h2. Retrospective actions

- *Start*: Tener API keys listas antes del Sprint
- *Start*: Mock de servicios externos en desarrollo
