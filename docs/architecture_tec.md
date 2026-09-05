# Arquitectura Técnica

> Ecosistema educativo basado en retos de producción (**retos de aprendizaje**) y
> **Prueba de Trabajo**. Este documento describe la arquitectura técnica de la plataforma:
> estructura de módulos, comunicación frontend/backend e integración con APIs e IA.


---

## 1. Resumen Ejecutivo

El presente documento describe la arquitectura técnica de la plataforma
**Quality Opportunities**; un ecosistema educativo basado en retos de producción
y prueba de trabajo, orientado a que los estudiantes universitarios acrediten
experiencia real de ingeniería en su currículum. Se detalla la estructura de
módulos, la comunicación entre la capa de presentación y la capa de servicios,
y la integración con inteligencia artificial y servicios externos.

---

## 2. Resumen de la arquitectura

La plataforma sigue un esquema **por capas y módulos desacoplados**. Las empresas
publican retos de optimización y deuda técnica; los estudiantes los resuelven en un
**entorno de pruebas aislado** y cada entrega se somete a más de 50 pruebas
automatizadas de rendimiento. Al validarse la solución, se emite **La Insignia**:
una microcredencial inmutable con resumen criptográfico **SHA-256**, verificable
públicamente e incrustable en el currículum del estudiante.

**Principios arquitectónicos:**

- Separación estricta de responsabilidades por capas.
- Comunicación **sin estado** mediante interfaces REST sobre HTTPS/JSON, con
  contratos validados de extremo a extremo.
- Evaluación **objetiva y reproducible** mediante contenedores efímeros con
  límites de procesador y memoria (grupos de control, *cgroups*).
- Inteligencia artificial **pedagógica**: orienta mediante el método socrático y
  **jamás genera código funcional** ni resuelve el reto por el estudiante.

---

## 3. Diagrama general

```mermaid
flowchart TB
    Estudiante["Estudiante<br/>(5.º a 9.º ciclo)"]
    Empresa["Empresa<br/>(publica retos)"]

    subgraph PRESENTACION["CAPA DE PRESENTACIÓN · React / Next.js + Tailwind CSS"]
        WebUI["Aplicación web"]
        Monaco["Monaco Editor<br/>(edición y visor de diferencias)"]
    end

    subgraph SERVICIOS["CAPA DE SERVICIOS · Python FastAPI + Pydantic"]
        Gateway["Pasarela de API<br/>(puntos de acceso REST)"]
        MRetos["Módulo de Retos"]
        Ranking["Ranking de Insignia"]
        MInsignia["Módulo La Insignia"]
        MAprendizaje["Módulo de Aprendizaje"]
    end

    subgraph PRUEBAS["ENTORNO DE PRUEBAS"]
        Contenedores["Contenedores"]
        Stress["Pruebas de Estrés<br/>&gt;1000 solicitudes/s · percentil 95 &lt; 50 ms · &lt; 3 s"]
    end

    subgraph IA["CAPA DE INTELIGENCIA ARTIFICIAL"]
        Tutor["Tutor IA"]
        LLM["Modelo de lenguaje externo"]
    end

    subgraph DATOS["CAPA DE DATOS"]
        PG[("PostgreSQL")]
        RDS[("Redis")]
    end

    Estudiante --> WebUI
    Empresa --> Gateway
    WebUI --> Monaco
    WebUI -- HTTPS / JSON --> Gateway
    Gateway --> MRetos
    MRetos --> Contenedores
    Contenedores --> Stress
    Stress --> Ranking
    Ranking --> MInsignia
    MInsignia -- insignia verificable --> WebUI
    Gateway --> Tutor
    Tutor --> LLM
    Gateway --> PG
    Gateway --> RDS
    Contenedores --> RDS
    MAprendizaje --> Monaco
```

---

## 4. Capas y módulos

### 4.1 Capa de presentación — React / Next.js + Tailwind CSS

| Módulo | Responsabilidad |
|---|---|
| **Aplicación web** | Interfaz para estudiantes y empresas: catálogo de retos, currículum dinámico e informes de telemetría. |
| **Monaco Editor** | Edición de código en el navegador y **visor de diferencias** interactivo entre la implementación del estudiante y la solución óptima. |

### 4.2 Capa de servicios — Python (FastAPI) + Pydantic

| Módulo | Responsabilidad |
|---|---|
| **Pasarela de API** | Punto de entrada único; valida los contratos de datos y enruta las peticiones hacia los módulos correspondientes. |
| **Módulo de Retos** | Gestiona el ciclo de vida del reto: repositorio aislado, datos simulados y especificaciones de rendimiento. |
| **Ranking de Insignia** | Recibe las métricas del entorno de pruebas, valida los umbrales y calcula la clasificación. |
| **Módulo La Insignia** | Emite la credencial inmutable: resumen criptográfico SHA-256 de la confirmación de cambios más las métricas de ejecución. |
| **Módulo de Aprendizaje** | Aprendizaje vicario: sirve la comparación entre el código del estudiante y la solución óptima una vez cerrado el reto. |

### 4.3 Entorno de pruebas

| Módulo | Responsabilidad |
|---|---|
| **Contenedores** | Ejecución en contenedores efímeros con límites de procesador y memoria; aislamiento estricto respecto al servidor. |
| **Pruebas de Estrés** | Más de 50 pruebas automatizadas que evalúan concurrencia (**superior a 1000 solicitudes por segundo**), latencia (**percentil 95 inferior a 50 ms**) y estabilidad de memoria en **menos de 3 segundos**. |

### 4.4 Capa de inteligencia artificial

| Módulo | Responsabilidad |
|---|---|
| **Tutor IA** | Asistencia socrática: analiza el árbol de sintaxis abstracta del código y plantea preguntas orientadas a arquitectura y algoritmos. Directiva inquebrantable: nunca genera código. |
| **Modelo de lenguaje externo** | Servicio de modelos de lenguaje optimizado mediante **caché de indicaciones** para reducir costos de operación. |

### 4.5 Capa de datos

| Motor | Uso |
|---|---|
| **PostgreSQL** | Persistencia relacional: retos, envíos, insignias y usuarios. |
| **Redis** | Colas de evaluación de rendimiento y caché de telemetría. |

---

## 5. Comunicación entre capas

La comunicación entre la capa de presentación y la capa de servicios es
**asíncrona, sin estado y basada en REST sobre HTTPS/JSON**. Toda petición y
respuesta se valida con contratos estrictos definidos mediante Pydantic.

**Puntos de acceso principales:**

```text
POST /api/retos                          Publicación de un reto (empresa)
POST /api/envios                         Envío de la solución (estudiante)
GET  /api/envios/{id}/telemetria         Informe de métricas de la ejecución
GET  /api/insignias/{resumen}            Verificación pública de La Insignia
GET  /api/retos/{id}/diferencias         Comparador de código (aprendizaje)
POST /api/tutor/consultas                Consulta socrática al Tutor IA
```

---

## 6. Proceso integral de un reto

```mermaid
sequenceDiagram
    autonumber
    actor Est as Estudiante
    participant Web as Aplicación web
    participant Mon as Monaco Editor
    participant API as Pasarela de API
    participant Dat as PostgreSQL / Redis
    participant San as Entorno de pruebas
    participant Ran as Ranking de Insignia
    participant Ins as Módulo La Insignia
    participant Tut as Tutor IA

    Est->>Web: Selecciona un reto publicado
    Web->>Mon: Edita el código en el navegador
    Mon->>API: Envía la solución (código e identificador del reto)
    API->>Dat: Registra el envío y encola la evaluación
    API->>San: Lanza un contenedor efímero con límites de recursos
    San->>San: Ejecuta más de 50 pruebas de estrés (menos de 3 s)
    San-->>Ran: Remite las métricas de rendimiento
    alt Pruebas superadas
        Ran->>Ins: Solicita la emisión de La Insignia
        Ins-->>Web: Insignia SHA-256 con enlace público de verificación
        Web-->>Est: Currículum con experiencia real acreditada
    else Pruebas no superadas
        Ran-->>Web: Informe de telemetría con las observaciones
        Est->>Tut: Realiza una consulta socrática
        Tut-->>Est: Recibe orientación (nunca código resuelto)
    end
```

---

## 7. Integración con inteligencia artificial y servicios externos

| Servicio | Función dentro de la plataforma |
|---|---|
| **API de modelo de lenguaje** | Motor del Tutor IA; recibe el contexto construido a partir del árbol de sintaxis abstracta y devuelve orientación socrática. |
| **Vercel** | Alojamiento de la capa de presentación. |
| **Railway** | Alojamiento de la capa de servicios y de los trabajadores del entorno de pruebas. |
| **Supabase** | Instancia gestionada de PostgreSQL. |

---

## 8. Seguridad y trazabilidad

- **Inmutabilidad de la credencial:** La Insignia se calcula como resumen
  criptográfico SHA-256 de la confirmación de cambios y de las métricas de
  ejecución; cualquier alteración invalida la verificación pública.
- **Aislamiento de ejecuciones:** cada envío se evalúa en un contenedor efímero
  con límites de procesador y memoria; ningún código se ejecuta sobre el servidor.
- **Objetividad de la evaluación:** se miden exclusivamente competencias técnicas
  verificables (algoritmos, latencia, concurrencia, perfilado de memoria y calidad
  del software).

---

## 9. Tecnologías empleadas

| Capa | Tecnologías |
|---|---|
| Presentación | React / Next.js, Tailwind CSS, Monaco Editor |
| Servicios | Python, FastAPI (asincronía nativa), Pydantic |
| Datos | PostgreSQL, Redis |
| Entorno de pruebas | Contenedores Docker efímeros con grupos de control, integración y entrega continuas |
| Inteligencia artificial | Modelo de lenguaje externo con caché de indicaciones, análisis de árbol de sintaxis abstracta |
| Infraestructura | Vercel, Railway, Supabase |

---