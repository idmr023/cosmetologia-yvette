h1. Sprint 08 — Fidelización + Reseñas

*Release*: v0.3.0 | *Período*: Semana 29–32 (Año 2) | *Cadencia*: 4 semanas

h2. Sprint Goal

{quote}
Implementar programa de lealtad y permitir reseñas post-cita
{quote}

h2. Backlog

|| ID || User Story || Pts || Estado ||
| US-023 | Acumular puntos por cada cita | 8 | ✅ |
| US-024 | Subir de nivel (Bronce/Plata/Oro) | 5 | ✅ |
| US-025 | Admin gestiona recompensas y niveles | 5 | ✅ |
| US-026 | Cliente deja reseña post-cita | 5 | ✅ |
| US-027 | Admin modera reseñas | 3 | ✅ |
| US-028 | Código de referido para descuento | 5 | ✅ |
| TSK-010 | 7 nuevas tablas + migración (loyalty, reviews, referrals) | 5 | ✅ |
| *Total* | | *36* | *✅* (capacity: 32, completed: 32) |

h2. Daily highlights

- D1–D5: Schema: 7 tablas (loyalty_tiers, loyalty_points, loyalty_transactions, loyalty_rewards, client_rewards, reviews, referral_codes, referral_usage)
- D6–D10: Endpoints de fidelización: puntos, niveles, recompensas, canje
- D11–D14: LoyaltyCard widget (nivel, progreso, actividad, canje)
- D15–D18: Reviews: rating 1-5, formulario post-cita, moderación admin, sección landing
- D19–D20: Referidos: código único, descuento 10%, tracking de uso

h2. Sprint Review outcome

{quote}
✅ *Aceptado*: Elizabeth vio su nivel Oro con 520 puntos. "Ahora pregunto si quiere canjear su descuento."
{quote}

h2. Retrospective actions

- *Start*: Separar seed de datos de prueba vs producción
- Crear {{scripts/seed-e2e.ts}}
