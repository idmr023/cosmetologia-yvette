# Índice del Informe — Proyecto Final

Basado en el Anexo 1 del documento "PROY_INDICACIONES Y RÚBRICA_S12F".

> **Leyenda:** ✅ Implementado · 🟡 Parcial · ❌ Pendiente · 📄 En docs

---

## 1. Análisis Empresarial

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Introducción | ❌ Pendiente | Crear en `docs/EMPRESA.md` |
| b. Descripción de la empresa | 🟡 Parcial | Datos en `AGENTS.md` (Yvette, RUC, dirección) |
| c. Visión | ❌ Pendiente | Definir con el equipo |
| d. Misión | ❌ Pendiente | Definir con el equipo |
| e. Análisis de Negocio (Lean Canvas) | ❌ Pendiente | Crear en `docs/LEAN_CANVAS.md` |
| f. Mapa de Procesos (AS-IS) | ❌ Pendiente | Crear diagrama en `docs/PROCESOS_AS_IS.md` |
| g. Oportunidades de mejora y modelo propuesto (TO-BE) | ❌ Pendiente | Crear en `docs/PROCESOS_TO_BE.md` |

---

## 2. Planificación y Gestión del Proyecto

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Project Charter | ❌ Pendiente | Crear en `docs/PROJECT_CHARTER.md` |
| b. Alcance y objetivos del proyecto | 🟡 Parcial | Inferible de features existentes |
| c. Cronograma del proyecto (Diagrama de Gantt) | ❌ Pendiente | Crear en `docs/GANTT.md` |
| d. Planificación ágil – Sprint Planning | ❌ Pendiente | Documentar en `docs/SPRINTS.md` |
| e. Roles y artefactos Scrum | ❌ Pendiente | Definir equipo Scrum |
| f. Tablero Kanban/Scrum | ❌ Pendiente | GH Projects o similar |
| g. Product Backlog | 🟡 Parcial | Features en este documento |
| h. Historias de usuario | ❌ Pendiente | Crear en `docs/USER_STORIES.md` |

---

## 3. Selección y Configuración de Herramientas de Desarrollo

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Selección de herramientas | ✅ Implementado | Stack definido en `docs/ARCHITECTURE.md` |
| b. Evidencias de configuración de herramientas | 🟡 Parcial | `package.json`, `tsconfig.json`, `next.config.mjs` |
| c. Repositorio GitHub | ✅ Implementado | Repo activo con commits |
| i. Estructura del repositorio | 🟡 Parcial | Documentar en `docs/REPO_STRUCTURE.md` |
| ii. Archivo README.md | ✅ Implementado | Existe en raíz |

---

## 4. Prototipos

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Wireframes de baja fidelidad | ❌ Pendiente | Crear en Figma / docs |
| b. Mockups de alta fidelidad | ❌ Pendiente | Capturar de la app real |
| c. Principios y buenas prácticas UX/UI aplicadas | 🟡 Parcial | En `docs/COMPONENTS.md` y `AGENTS.md` |
| d. Navegación y flujo de interacción del usuario | 🟡 Parcial | En `docs/ARCHITECTURE.md` (route groups) |

---

## 5. Gestión de Riesgos del Proyecto

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Identificación de riesgos | ❌ Pendiente | Crear en `docs/RISK_MATRIX.md` |
| b. Mapa de riesgos (Matriz Probabilidad–Impacto + Heatmap) | ❌ Pendiente | Crear en `docs/RISK_MATRIX.md` |
| c. Plan de gestión de riesgos | ❌ Pendiente | Crear en `docs/RISK_MANAGEMENT.md` |
| i. Estrategias de mitigación y respuesta | ❌ Pendiente | Incluir en plan |
| ii. Seguimiento y control de riesgos | ❌ Pendiente | Incluir en plan |

---

## 6. Definición de Métricas y Niveles de Servicio

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Identificación de KPIs y métricas del sistema | 🟡 Parcial | Definir en `docs/PERFORMANCE.md` |
| b. Definición de SLA y SLO | ❌ Pendiente | Crear en `docs/SLA.md` |
| c. Plan de Medición y Monitoreo | ❌ Pendiente | Crear en `docs/MONITORING.md` |
| i. Herramientas de monitoreo utilizadas | ❌ Pendiente | Definir stack de monitoreo |
| ii. Métricas recolectadas | ❌ Pendiente | CPU, RAM, disco, red, respuesta |

---

## 7. Desarrollo e Implementación Técnica

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Arquitectura general del sistema | ✅ Implementado | `docs/ARCHITECTURE.md` |
| b. Estructura del código fuente | ✅ Implementado | `docs/COMPONENTS.md` + repo |
| c. Código optimizado y evidencia técnica | 🟡 Parcial | Falta WPO (ver `docs/WPO.md`) |
| d. Estrategias WPO | ❌ Pendiente | Crear en `docs/WPO.md` |
| i. Métricas antes y después de la optimización | ❌ Pendiente | Lighthouse |
| ii. Estrategias implementadas | ❌ Pendiente | Lazy loading, caching, etc. |

---

## 8. Implementación y Administración de Base de Datos

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Diseño físico de base de datos | ✅ Implementado | `backend/src/lib/schema.ts` + `docs/DATABASE.md` |
| b. Informe de Administración y Replicación | ❌ Pendiente | Crear en `docs/DB_ADMIN.md` |
| i. Estrategia de respaldo y replicación | ❌ Pendiente | Neon built-in branching |
| ii. Configuración de alta disponibilidad | ❌ Pendiente | Neon HA, connection pooling |
| iii. Evidencias de monitoreo y administración | ❌ Pendiente | Neon dashboard |
| c. Implementación del Patrón de Acceso a Datos | 🟡 Parcial | Repository pattern en `backend/src/repositories/` |
| i. Patrón de Acceso a Datos elegido | ✅ Implementado | Repository Pattern |
| ii. Diagrama de clases de muestra | ❌ Pendiente | Crear diagrama |
| iii. Ejemplo de código implementado | ✅ Implementado | 7 repositories |

---

## 9. Seguridad del Sistema

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Catálogo de controles de seguridad | ✅ Implementado | `docs/SECURITY.md` (12 capas) |
| b. Módulo de Autenticación y Autorización | ✅ Implementado | JWT + NextAuth + RBAC |
| c. Informe Técnico de Seguridad y Cifrado de Datos | 🟡 Parcial | pgcrypto documentado |
| d. Pruebas de seguridad web | ❌ Pendiente | Crear en `docs/SECURITY_TESTING.md` |
| i. Metodología empleada | ❌ Pendiente | OWASP ZAP |
| ii. Resultados y vulnerabilidades detectadas | ❌ Pendiente | Pendiente ejecutar |
| iii. Acciones correctivas y recomendaciones | ❌ Pendiente | Pendiente ejecutar |

---

## 10. Validación y Verificación del Sistema

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Plan de pruebas del sistema | 🟡 Parcial | Tests existentes en `backend/src/__tests__/` |
| b. Evidencias de pruebas del sistema | 🟡 Parcial | 3 test files (bajo coverage) |

---

## 11. Despliegue

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Manual de despliegue | ❌ Pendiente | Crear en `docs/DEPLOYMENT.md` |
| b. Evidencia de pruebas de despliegue | ❌ Pendiente | CI/CD pipeline |

---

## 12. Calidad Funcional y Pruebas Automatizadas

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Evidencia de implementación de pruebas funcionales | 🟡 Parcial | Vitest + Jest configurados |
| i. Frameworks utilizados | ✅ Implementado | Vitest, Jest, Supertest, Testing Library |
| ii. Listado de casos de prueba | ❌ Pendiente | Crear inventario de tests |
| b. Evidencia de ejecución | 🟡 Parcial | `npm run test` funciona |
| i. Capturas de ejecución | ❌ Pendiente | Tomar screenshots |
| ii. Reportes de cobertura | ❌ Pendiente | Configurar coverage |
| c. Métricas, nivel de cumplimiento y observaciones | ❌ Pendiente | Coverage targets |

---

## 13. Interoperabilidad y Pruebas de Integración

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Sistemas externos a integrar | 🟡 Parcial | Telegram bot existente, Google OAuth |
| b. Evidencia de implementación de pruebas de integración | ❌ Pendiente | Crear en `docs/INTEGRATION_TESTING.md` |
| i. Frameworks utilizados | 🟡 Parcial | Supertest |
| ii. Lista de casos de prueba | ❌ Pendiente | Pendiente |
| c. Evidencia de ejecución | ❌ Pendiente | Pendiente |
| d. Métricas, nivel de cumplimiento y observaciones | ❌ Pendiente | Pendiente |

---

## 14. Pruebas Automatizadas de Usabilidad

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Evidencia de implementación de pruebas de usabilidad | ❌ Pendiente | Crear en `docs/USABILITY_TESTING.md` |
| i. Frameworks utilizados | ❌ Pendiente | Playwright / Lighthouse CI |
| ii. Lista de casos de prueba | ❌ Pendiente | Pendiente |
| b. Evidencia de ejecución | ❌ Pendiente | Pendiente |
| c. Métricas, nivel de cumplimiento y observaciones | ❌ Pendiente | Pendiente |

---

## 15. Informe de Evaluación de Usabilidad (ISO 25010)

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Criterios, métricas y evidencias empleadas | ❌ Pendiente | Crear en `docs/USABILITY_ISO25010.md` |
| i. Facilidad de aprendizaje | ❌ Pendiente | Evaluar |
| ii. Protección contra errores del usuario | ❌ Pendiente | Evaluar |
| iii. Asistencia al usuario | ❌ Pendiente | Evaluar |
| iv. Compromiso/participación del usuario | ❌ Pendiente | Evaluar |
| b. Resultados | ❌ Pendiente | Pendiente |
| c. Conclusiones | ❌ Pendiente | Pendiente |

---

## 16. Informe de Evaluación de Rendimiento (ISO 25010)

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Descripción del entorno de pruebas | ❌ Pendiente | Crear en `docs/PERFORMANCE.md` |
| b. Métricas evaluadas | ❌ Pendiente | Tiempo respuesta, CPU, RAM, throughput |
| c. Herramientas utilizadas | ❌ Pendiente | k6 / autocannon |
| d. Resultados y comparación con umbrales/SLA | ❌ Pendiente | Pendiente |
| e. Gráficos y reportes de monitoreo | ❌ Pendiente | Pendiente |
| f. Conclusiones y acciones de mejora | ❌ Pendiente | Pendiente |

---

## 17. Pruebas de Carga y Estrés

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Escenarios de prueba | ❌ Pendiente | Crear en `docs/LOAD_TESTING.md` |
| b. Herramientas utilizadas | ❌ Pendiente | k6 / JMeter |
| c. Resultados y análisis comparativo | ❌ Pendiente | Pendiente |
| d. Identificación de cuellos de botella | ❌ Pendiente | Pendiente |
| e. Propuestas de mejora | ❌ Pendiente | Pendiente |

---

## 18. Monitoreo de la Aplicación

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Monitoreo de recursos | ❌ Pendiente | Crear en `docs/MONITORING.md` |
| b. Herramientas utilizadas | ❌ Pendiente | Prometheus / Sentry |
| c. Reportes y capturas de monitoreo | ❌ Pendiente | Pendiente |
| d. Perfilamiento de código | ❌ Pendiente | Pendiente |
| e. Observaciones y conclusiones | ❌ Pendiente | Pendiente |

---

## 19. Pruebas de Mantenimiento

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Escenario del cambio realizado | ❌ Pendiente | Crear en `docs/MAINTENANCE_TESTING.md` |
| b. Casos de prueba ejecutados (antes y después) | ❌ Pendiente | Pendiente |
| c. Evidencias de ejecución | ❌ Pendiente | Pendiente |
| d. Impacto del cambio en el sistema | ❌ Pendiente | Pendiente |
| e. Estado final y conclusiones | ❌ Pendiente | Pendiente |

---

## 20. Informe de Pruebas de Alta Disponibilidad y Recuperación ante Desastres

| Item | Estado | Referencia / Notas |
|------|--------|--------------------|
| a. Escenarios de prueba simulados | ❌ Pendiente | Crear en `docs/HIGH_AVAILABILITY.md` |
| b. Métricas de recuperación | ❌ Pendiente | RTO, RPO |
| c. Descripción del entorno de pruebas | ❌ Pendiente | Alma Linux VMs |
| d. Herramientas y configuraciones utilizadas | ❌ Pendiente | PgBouncer, Neon branching |
| e. Evidencias de ejecución de pruebas de Alta Disponibilidad | ❌ Pendiente | Pendiente |
| f. Evidencias de ejecución de pruebas de Recuperación | ❌ Pendiente | Pendiente |
| g. Estado final y conclusiones | ❌ Pendiente | Pendiente |

---

## Conclusiones del Proyecto

❌ Pendiente — redactar al finalizar implementación.

## Recomendaciones del Proyecto

❌ Pendiente — redactar al finalizar implementación.

## Anexos

| Anexo | Estado |
|-------|--------|
| A. Script SQL y configuración de BD | ✅ Schema en `backend/src/lib/schema.ts` |
| B. Fragmentos de código fuente relevantes | 🟡 Seleccionar ejemplos clave |
| C. Reportes automatizados de pruebas | ❌ Pendiente |
| D. Reportes automatizados de seguridad | ❌ Pendiente |
| E. Reportes automatizados de funcionalidad | ❌ Pendiente |
| F. Reportes automatizados de integración | ❌ Pendiente |
| G. Reportes automatizados de usabilidad | ❌ Pendiente |
| H. Historial de commits en el repositorio | ✅ `git log` disponible |

## Referencias Bibliográficas

❌ Pendiente — agregar ISO 25010, documentos del curso, etc.
