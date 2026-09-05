# Quality Opportunities

> Ecosistema educativo basado en **Challenge-Based Learning** y **Proof-of-Work** que transforma retos técnicos reales en experiencia verificable para estudiantes. Cada solución es evaluada en un sandbox automatizado y puede convertirse en una microcredencial técnica auditable para el CV.

---

## 1. Problematica y Enfoque Lean MVP

### Problematica

La formación universitaria en desarrollo de software sigue apoyándose en ejercicios académicos aislados que hoy pueden ser resueltos en segundos con herramientas de IA. Como consecuencia, muchos estudiantes egresan con buenas notas, pero sin evidencia real de haber trabajado con concurrencia, resiliencia, profiling, despliegues automatizados o sistemas bajo carga.

En Perú, esta brecha coincide con una escasez importante de talento calificado en **TI y Datos**, mientras que las empresas continúan invirtiendo tiempo y recursos en validar candidatos cuyos CV no contienen evidencia técnica auditable.

Quality Opportunities busca atacar la paradoja del **“CV en blanco”**: el estudiante no puede demostrar experiencia porque nadie le confía problemas reales, y no obtiene acceso a problemas reales porque todavía no puede demostrar experiencia.

### Usuario Objetivo

El usuario principal es el **estudiante universitario de 5.º a 9.º ciclo** de Ingeniería de Sistemas, Software, Computación y carreras afines, con conocimientos teóricos de programación y bases de datos, pero con poca o ninguna experiencia verificable en sistemas de producción.

Como actores secundarios participan:

- **Empresas**, que pueden convertir tareas secundarias de optimización y deuda técnica no crítica en retos delimitados.
- **Universidades**, que pueden utilizar los retos como evidencia de resolución de problemas complejos de ingeniería y aprendizaje aplicado.

### Propuesta de Valor y Alcance Lean MVP

El MVP convierte problemas técnicos reales o realistas en retos evaluables de manera objetiva.

Flujo principal:

1. **Publicación del reto:** una empresa, organización o administrador publica un reto técnico delimitado con datos simulados, criterios de aceptación y métricas esperadas.
2. **Resolución del estudiante:** el alumno implementa su solución dentro del entorno definido por la plataforma.
3. **Evaluación automatizada:** un sandbox CI/CD efímero ejecuta pruebas funcionales, de estrés y rendimiento.
4. **Scorecard técnico:** se registran métricas como latencia, throughput, estabilidad y cumplimiento de pruebas.
5. **Emisión de La Insignia:** la plataforma genera una microcredencial vinculada al resultado y al commit evaluado.
6. **CV Dinámico:** el estudiante incorpora evidencia verificable de su desempeño técnico a su perfil y currículum.

### Ejemplos de Retos

- Optimización de concurrencia y caching con Redis.
- Idempotencia y resiliencia en transacciones.
- Pipelines ETL y sanitización masiva de datos.
- Optimización de endpoints bajo alta carga.
- Detección de memory leaks y degradación de rendimiento.

---

## 2. Enlaces de Acceso y Entregables Oficiales

| Entregable | Enlace / Ubicacion | Estado |
| :--- | :--- | :--- |
| **Demo en Produccion** | Pendiente de URL final | En desarrollo |
| **Repositorio Principal** | `MizardB/Hackhaton` | Activo |
| **Arquitectura Macro (C2)** | Pendiente de documentación final | En desarrollo |
| **Deck de Presentacion** | Pendiente de carga al repositorio | En desarrollo |
| **Release Fase 1** | Tag GitHub por definir | Pendiente |
| **Release Fase 2** | Tag GitHub por definir | Pendiente |

---

## 3. Arquitectura Conceptual

```text
Empresa / Administrador
        |
        v
Publicación de reto técnico
        |
        v
Estudiante en Quality Opportunities
        |
        v
Implementación de solución
        |
        v
Sandbox Docker + CI/CD
        |
        +--> Tests funcionales
        +--> Stress tests
        +--> Métricas de rendimiento
        +--> Validación de memoria / estabilidad
        |
        v
Scorecard técnico
        |
        v
La Insignia (SHA-256)
        |
        v
CV Dinámico con evidencia verificable
```

---

## 4. Stack Tecnologico e Inteligencia Artificial

| Capa | Tecnologia / Servicio | Justificacion Tecnica |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js / Tailwind CSS | Interfaz web moderna, responsive y orientada a una experiencia interactiva. |
| **Editor Web** | Monaco Editor | Edición y visualización de código y diffs directamente en navegador. |
| **Backend** | Python + FastAPI | APIs asíncronas, ejecución de pruebas, webhooks y servicios de evaluación. |
| **Validacion** | Pydantic | Contratos estrictos y validación estructurada de entradas y resultados. |
| **Base de Datos** | PostgreSQL | Persistencia relacional de usuarios, retos, intentos, resultados e insignias. |
| **Caching / Colas** | Redis | Soporte para benchmarking, colas y escenarios de optimización. |
| **Sandbox** | Docker | Aislamiento efímero de ejecuciones y límites de CPU/memoria. |
| **CI/CD** | Pipeline automatizado | Ejecución reproducible de tests, benchmarks y validaciones por entrega. |
| **IA** | Tutor IA Socrático | Asistencia pedagógica orientada a arquitectura y razonamiento sin entregar la solución completa. |
| **Credencial** | SHA-256 | Vinculación de la insignia con evidencia técnica y resultados verificables. |

### Tutor IA Socrático

El Tutor IA analiza el código y guía al estudiante mediante preguntas sobre arquitectura, algoritmos, trade-offs y decisiones de diseño. Su función es **enseñar y desafiar**, no resolver el reto ni entregar código funcional listo para copiar.

### Aprendizaje Vicario y Diff

Al cierre de un reto, el estudiante puede comparar su implementación con una solución de referencia mediante un visor de diferencias, entendiendo las decisiones técnicas y trade-offs utilizados en una solución optimizada.

---

## 5. Evaluacion Tecnica y Testing

La calidad del proyecto depende de que cada reto tenga criterios objetivos y reproducibles.

El sandbox debe validar, según el tipo de desafío:

- **Happy Path:** flujo principal completado correctamente.
- **Critical Error Paths:** entradas inválidas, fallos de red o condiciones límite.
- **Stress Testing:** comportamiento bajo carga y concurrencia.
- **Performance:** throughput y latencia.
- **Memory Stability:** detección de consumo anómalo y posibles memory leaks.
- **Idempotencia:** ausencia de efectos duplicados ante reintentos.
- **Resiliencia:** comportamiento ante fallos parciales de servicios.

### Métricas objetivo de referencia

La propuesta plantea escenarios donde el entorno puede evaluar:

- Más de **50 pruebas automatizadas** por reto.
- Rendimiento superior a **1,000 requests/segundo** en retos que lo requieran.
- Latencia objetivo de referencia **p95 < 50 ms**.
- Evaluación reproducible dentro de un entorno aislado.

> Las métricas concretas deben definirse por reto. No todos los desafíos utilizarán los mismos thresholds.

---

## 6. La Insignia y el CV Dinamico

Cuando una solución cumple los criterios técnicos, Quality Opportunities genera **La Insignia**, una microcredencial vinculada a:

- Identidad del reto.
- Commit o entrega evaluada.
- Resultado de la suite de pruebas.
- Métricas de rendimiento.
- Scorecard técnico.
- Hash SHA-256 para integridad y verificación.

El objetivo es reemplazar declaraciones vagas como:

> “Experiencia en backend.”

por evidencia concreta y verificable del tipo:

> “Optimizó un flujo transaccional bajo restricciones de latencia y resiliencia, validado mediante pruebas automatizadas y telemetría.”

---

## 7. Modelo de Negocio

Quality Opportunities está planteado como una plataforma educativa y de validación técnica, **no como una bolsa de empleo**.

| Segmento | Modelo |
| :--- | :--- |
| **Estudiantes — Free** | Acceso a retos, sandbox CI/CD y emisión de insignias. |
| **Estudiantes — Pro** | Tutor IA Socrático, scorecards avanzados, telemetría y visor Diff. |
| **Empresas — B2B** | Publicación de retos y posibilidad de patrocinio o employer branding. |
| **Universidades — B2U** | Integración curricular y uso institucional de retos y evidencia técnica. |

La propuesta plantea un Plan Pro de referencia de **S/. 12 por reto o S/. 35 al mes** y una futura licencia institucional para universidades.

---

## 8. Estrategia de Arranque y Escalabilidad

Para evitar depender desde el primer día de acuerdos con empresas, la primera fase puede comenzar con retos construidos a partir de:

- Casos de estudio públicos.
- Arquitecturas open source documentadas.
- Patrones de caching y concurrencia.
- Idempotencia en APIs y pasarelas abiertas.
- Pipelines de datos y procesamiento asíncrono.

Esto permite que los estudiantes comiencen a generar evidencia desde el primer momento mientras se construyen alianzas corporativas.

### Roadmap inicial

1. **Fase 1 — Backend & Performance**
   - Caching.
   - Concurrencia.
   - Idempotencia.
   - ETL.
   - Resiliencia.

2. **Fase 2 — Data Engineering**
   - Procesamiento asíncrono.
   - Streaming.
   - Kafka.
   - Pipelines distribuidos.

3. **Fase 3 — Ciberseguridad y nuevas disciplinas**
   - Expansión del estándar de retos e insignias hacia otras áreas de ingeniería.

---

## 9. Guia de Setup y Ejecucion Local

> Esta sección se actualizará con los comandos definitivos cuando quede cerrada la estructura final del repositorio.

### Requisitos Previos

- Git
- Node.js 20+
- Python 3.11+
- Docker
- PostgreSQL
- Redis

### Clonar el repositorio

```bash
git clone https://github.com/MizardB/Hackhaton.git
cd Hackhaton
```

### Flujo esperado de desarrollo

```bash
# Frontend
npm install
npm run dev

# Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

> Los paths y comandos exactos pueden variar mientras se consolida la arquitectura del MVP.

---

## 10. Equipo de Desarrollo: SinergIA

| N° | Integrante | Especialidad | Rol en el Proyecto | Perfil GitHub | Foco Operativo |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **01** | **Manuel Aranda (Manu)** | **M6** (Mecatronica) | **Team Leader, AI Architect, PM & Pitch Lead** | [@MizardB](https://github.com/MizardB) | Direccion, Arquitectura IA/C2, Gobernanza Git, Despliegue Cloud y Pitch. |
| **02** | **Miguel** | **I2** (Sistemas) | **Frontend Lead (UI/UX & Client Core)** | [@Miguel-Ghost](https://github.com/Miguel-Ghost) | Desarrollo de interfaz, integracion con APIs, responsive design y UX. |
| **03** | **Brian** | **I2** (Sistemas) | **Backend Lead (API, DB & Services)** | [@BrianJY-14](https://github.com/BrianJY-14) | Construccion de endpoints, logica de negocio, pipeline de datos e integracion de IA. |
| **04** | **Alex** | **M6** (Mecatronica) | **QA & Testing Lead (Automation & Quality)** | [@josealexandromartinezcox-stack](https://github.com/josealexandromartinezcox-stack) | Suite de pruebas automaticas, validacion de edge cases, stress testing y smoke testing. |

---

## 11. Vision

**Quality Opportunities quiere convertir el aprendizaje técnico en evidencia.**

No buscamos que un estudiante diga que sabe construir software robusto: buscamos que pueda demostrarlo con código sometido a pruebas reales, métricas reproducibles y resultados verificables.
