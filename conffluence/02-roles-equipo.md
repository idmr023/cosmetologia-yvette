h1. 02 — Roles del Equipo SCRUM

h2. Composición

h3. Product Owner — El desarrollador

|| Atributo || Descripción ||
| Persona | Único desarrollador del sistema |
| Responsabilidad | Definir y priorizar el Product Backlog, maximizar el valor del producto, tomar decisiones sobre requerimientos |
| Disponibilidad | Tiempo parcial (estudios + desarrollo), disponible 5/7 días para consultas del SM |
| Nota | Rol dual PO+Dev: decisión consciente por tratarse de un proyecto académico. Las ceremonias y artefactos se adaptan a esta realidad sin perder la esencia SCRUM |

h3. Scrum Master — Mentora externa

|| Atributo || Descripción ||
| Persona | Profesional/asesora con experiencia en metodologías ágiles |
| Responsabilidad | Facilitar ceremonias SCRUM, remover impedimentos, asegurar adherencia al marco, coach del equipo |
| Disponibilidad | Sesiones semanales de 30 min + revisión de artefactos |
| Funciones | Vela por que las retrospectivas generen acciones concretas. No interviene en decisiones de backlog |

h3. Development Team — El desarrollador

|| Atributo || Descripción ||
| Tamaño | 1 persona |
| Stack | Next.js 14, Express, TypeScript, Drizzle ORM, Neon (PostgreSQL), Tailwind, NextAuth |
| Responsabilidad | Auto-organización del trabajo, estimación de historias, calidad técnica, definición de DoD |
| Roles técnicos tácitos | Frontend, backend, DB, DevOps, QA — todo en una persona |

h2. Dual-role PO+Dev: adaptación SCRUM

El marco SCRUM canónico exige separación de roles. Para un equipo de 1 persona, se adoptaron las siguientes adaptaciones:

- *Product Backlog priorizado en sesiones con el SM*, no en aislamiento. El SM actúa como "espejo" para evitar sesgos del PO único.
- *Sprint Planning guiada* con el SM: el Dev estima y el PO valida prioridades. Al ser la misma persona, se alterna explícitamente el "sombrero" según la fase de la ceremonia.
- *Sprint Review con stakeholders reales* (Yvette, colaboradoras) para validar el incremento, no solo autoevaluación.
- *Daily Scrum asincrónico escrito* con registro público, reemplazando la reunión oral de 15 min (inviable para 1 dev).

Esta variante es reconocida como *"Scrum Solo"* o *"Personal Scrum"* y es aceptada en contextos académicos donde el equipo de desarrollo es unitario pero se conservan las ceremonias, artefactos y valores de SCRUM.
