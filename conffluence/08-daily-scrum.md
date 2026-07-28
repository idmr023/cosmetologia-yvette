h1. 08 — Daily Scrum

h2. Formato asincrónico para equipo de 1 dev

Dado que el Development Team es una sola persona, el Daily Scrum se realiza de forma *asincrónica y escrita* en un documento compartido (Google Docs / Confluence page), visible para PO y SM.

h3. Las 3 preguntas

Cada día hábil, el Dev responde por escrito antes de las 10:00 a.m.:

1. *¿Qué hice ayer que ayudó al equipo a cumplir el Sprint Goal?*
2. *¿Qué haré hoy para ayudar al equipo a cumplir el Sprint Goal?*
3. *¿Veo algún impedimento que me bloquee a mí o al equipo?*

h3. Ejemplo de entrada (Sprint 11, Día 14)

{code}
Fecha: 2026-10-14
Dev: [Nombre]

1. Ayer:
   - Completé la migración de Playwright de Cypress (3 spec files convertidas)
   - Corregí el timeout del webServer en playwright.config.ts
   - CI green en PR #23 (typecheck + lint + build)

2. Hoy:
   - Convertir 2 spec files restantes (admin/analitica, admin/resenas)
   - Testear mobile viewport en modo local

3. Impedimentos:
   - El webServer necesita que el backend esté en puerto 4000 — a veces
     conflict con otro proceso local. Solución: script kill-port
{code}

h3. Registro histórico

Cada Sprint tiene su propio documento de Daily Scrums (linkeado desde el [Sprint Backlog|./07-sprint-backlog.md] y desde el archivo de Sprint correspondiente en {{sprints/}}).

h3. Adaptación justificada

La Guía SCRUM 2020 dice: *"Los Developers pueden seleccionar la estructura y técnica que deseen, siempre que su Daily Scrum se centre en el progreso hacia el Sprint Goal y genere un plan accionable para el próximo día de trabajo."*

El formato escrito cumple este propósito:
- *Enfocado*: las 3 preguntas mantienen el foco en el Sprint Goal
- *Plan accionable*: las tareas del día son concretas y verificables
- *Transparencia*: el SM y PO tienen visibilidad sin depender de una reunión sincrónica
- *Artefacto histórico*: queda registro para retrospectivas
