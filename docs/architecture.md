# Arquitectura del Sistema y Base de Datos — Quality Opportunities

> Ecosistema educativo basado en retos de producción (**retos de aprendizaje**) y **Prueba de Trabajo**. Este documento consolida la arquitectura técnica de la plataforma y el modelo de datos: estructura de módulos, diagramas de interacción, entidades, clases UML e integración con APIs e IA.

---

## 1. Resumen Ejecutivo

El presente documento describe la arquitectura técnica de la plataforma **Quality Opportunities**; un ecosistema educativo basado en retos de producción y prueba de trabajo, orientado a que los estudiantes universitarios acrediten experiencia real de ingeniería en su currículum. Se detalla la estructura de módulos, la comunicación entre la capa de presentación y la capa de servicios, el modelo de datos relacional y clases del backend, y la integración con inteligencia artificial y servicios externos.

---

## 2. Resumen de la Arquitectura

La plataforma sigue un esquema **por capas y módulos desacoplados**. Las empresas publican retos de optimización y deuda técnica; los estudiantes los resuelven en un **entorno de pruebas aislado** y cada entrega se somete a más de 50 pruebas automatizadas de rendimiento. Al validarse la solución, se emite **La Insignia**: una microcredencial inmutable con resumen criptográfico **SHA-256**, verificable públicamente e incrustable en el currículum del estudiante.

**Principios arquitectónicos:**

- Separación estricta de responsabilidades por capas.
- Comunicación **sin estado** mediante interfaces REST sobre HTTPS/JSON, con contratos validados de extremo a extremo.
- Evaluación **objetiva y reproducible** mediante contenedores efímeros con límites de procesador y memoria (grupos de control, *cgroups*).
- Inteligencia artificial **pedagógica**: orienta mediante el método socrático y **jamás genera código funcional** ni resuelve el reto por el estudiante.

---

## 3. Diagrama General del Sistema

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

## 4. Capas y Módulos

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

## 5. Comunicación entre Capas

La comunicación entre la capa de presentación y la capa de servicios es **asíncrona, sin estado y basada en REST sobre HTTPS/JSON**. Toda petición y respuesta se valida con contratos estrictos definidos mediante Pydantic.

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

## 6. Proceso Integral de un Reto

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

## 7. Diagrama Entidad-Relación Conceptual

> **Alcance:** los tipos SQL, claves foráneas e índices quedan fuera de estos diagramas, por corresponder a la fase de implementación.

**14 entidades · 18 relaciones · Participación individual**

```mermaid
erDiagram
    USUARIO {
        identificador identificador "PK · propio"
        texto nombre
        texto correo
        texto logo "0..1"
    }
    ORGANIZACION {
        identificador identificador "PK · propio"
        texto nombre
        texto descripcion "0..1"
        texto sitio_web "0..1"
        texto logo "0..1"
    }
    PERFIL_ESTUDIANTE {
        texto nombre_publico
        texto biografia "0..1"
        visibilidad visibilidad
        texto universidad "0..1"
        texto carrera "0..1"
        entero ciclo "0..1"
    }
    REPRESENTACION {
        funcion funcion_autorizada
        momento momento_inicio
        momento momento_fin "0..1"
    }
    EVENTO_AUDITORIA {
        identificador identificador "PK · propio"
        momento momento
        texto accion
        resultado resultado
        origen origen
        texto referencia_recurso
        texto detalle_saneado "0..1"
    }
    SOLICITUD_RETO {
        identificador identificador "PK · propio"
        texto titulo_original
        texto descripcion_publica
        texto contenido_original_restringido "0..1"
        momento momento_recepcion
        estado estado_preparacion
        texto modelo_ia "0..1"
        texto version_instrucciones "0..1"
        texto resumen_preparacion "0..1"
        texto detalle_error "0..1"
    }
    RETO {
        identificador identificador "PK · propio"
        texto titulo
        texto descripcion
        texto criterios_aceptacion
        momento momento_incorporacion
        estado estado
        momento momento_publicacion "0..1"
        momento momento_cierre "0..1"
        texto repositorio_base "0..1"
        texto version_base "0..1"
    }
    PARTICIPACION {
        identificador identificador "PK · propio"
        momento momento_incorporacion
        estado estado
    }
    PRUEBA {
        identificador identificador "PK · propio"
        texto nombre
        categoria categoria
        booleano obligatoria
        texto condicion_aprobacion
        duracion limite_ejecucion "0..1"
    }
    ENTREGA {
        identificador identificador "PK · propio"
        entero numero_intento
        momento momento_entrega
        texto repositorio
        texto commit
        texto referencia_ejecutable
    }
    EVALUACION {
        identificador identificador "PK · propio"
        estado estado_procesamiento
        momento momento_solicitud
        momento momento_inicio "0..1"
        momento momento_fin "0..1"
        texto version_evaluador
        texto detalle_error "0..1"
    }
    RESULTADO_PRUEBA {
        condicion condicion_ejecucion
        booleano aprobada "0..1"
        decimal valor_observado "0..1"
        texto unidad "0..1"
        duracion duracion "0..1"
        texto detalle "0..1"
    }
    CREDENCIAL {
        identificador identificador_publico "PK · propio"
        momento momento_emision
        texto contenido_emitido
        texto huella_contenido
    }
    REVOCACION_CREDENCIAL {
        momento momento_revocacion
        texto motivo
    }

    USUARIO ||--o| PERFIL_ESTUDIANTE : "posee"
    USUARIO ||--o| REPRESENTACION : "ejerce"
    REPRESENTACION }o--|| ORGANIZACION : "es responsable de"
    USUARIO ||--o{ EVENTO_AUDITORIA : "origina"
    ORGANIZACION ||--o{ SOLICITUD_RETO : "presenta"
    SOLICITUD_RETO ||--o| RETO : "genera"
    ORGANIZACION ||--o{ RETO : "publica"
    USUARIO ||--o{ PARTICIPACION : "realiza"
    RETO ||--o{ PARTICIPACION : "tiene"
    PARTICIPACION ||--o{ ENTREGA : "origina"
    RETO ||--o{ ENTREGA : "recibe"
    RETO ||--o{ PRUEBA : "define"
    ENTREGA ||--|| EVALUACION : "recibe"
    EVALUACION ||--o{ RESULTADO_PRUEBA : "produce"
    RESULTADO_PRUEBA }o--|| PRUEBA : "corresponde"
    EVALUACION ||--o| CREDENCIAL : "sustenta"
    USUARIO ||--o{ CREDENCIAL : "conserva"
    CREDENCIAL ||--o| REVOCACION_CREDENCIAL : "recibe"
```

---

## 8. Clases UML del Backend

**14 clases de dominio + 4 servicios + 2 interfaces**

```mermaid
classDiagram
    class Usuario {
        -identificador: Identificador
        -nombre: Texto
        -correo: Texto
        -logo: Texto [0..1]
        +cambiarNombre(nombre: Texto) Vacio
        +actualizarPresentacion(nombre: Texto, logo: Texto) Vacio
    }
    class Organizacion {
        -identificador: Identificador
        -nombre: Texto
        -descripcion: Texto [0..1]
        -sitioWeb: Texto [0..1]
        -logo: Texto [0..1]
        +actualizarPresentacion(nombre: Texto, logo: Texto) Vacio
    }
    class PerfilEstudiante {
        -nombrePublico: Texto
        -biografia: Texto [0..1]
        -visibilidad: VisibilidadPerfil
        -universidad: Texto [0..1]
        -carrera: Texto [0..1]
        -ciclo: Entero [0..1]
        +actualizarPresentacion(nombre: Texto, biografia: Texto) Vacio
        +definirVisibilidad(visibilidad: VisibilidadPerfil) Vacio
    }
    class Representacion {
        -funcionAutorizada: FuncionRepresentante
        -momentoInicio: Momento
        -momentoFin: Momento [0..1]
        +estaActiva(en: Momento) Booleano
        +finalizar(en: Momento) Vacio
    }
    class EventoAuditoria {
        -identificador: Identificador
        -momento: Momento
        -accion: Texto
        -resultado: ResultadoOperacion
        -origen: OrigenEvento
        -referenciaRecurso: Texto
        -detalleSaneado: Texto [0..1]
    }
    class SolicitudReto {
        -identificador: Identificador
        -tituloOriginal: Texto
        -descripcionPublica: Texto
        -contenidoOriginalRestringido: Texto [0..1]
        -momentoRecepcion: Momento
        -estadoPreparacion: EstadoPreparacion
        -modeloIA: Texto [0..1]
        -versionInstrucciones: Texto [0..1]
        -resumenPreparacion: Texto [0..1]
        -detalleError: Texto [0..1]
        +iniciarPreparacion() Vacio
        +registrarPreparacion(modelo: Texto, version: Texto, resumen: Texto) Vacio
        +registrarError(detalle: Texto) Vacio
    }
    class Reto {
        -identificador: Identificador
        -titulo: Texto
        -descripcion: Texto
        -criteriosAceptacion: Texto
        -momentoIncorporacion: Momento
        -estado: EstadoReto
        -momentoPublicacion: Momento [0..1]
        -momentoCierre: Momento [0..1]
        -repositorioBase: Texto [0..1]
        -versionBase: Texto [0..1]
        +publicar(en: Momento) Vacio
        +cerrar(en: Momento) Vacio
        +admiteEntregas() Booleano
    }
    class Participacion {
        -identificador: Identificador
        -momentoIncorporacion: Momento
        -estado: EstadoParticipacion
        +condicionCertificacion: CondicionParticipacion (derivado, solo lectura)
        +admiteEntrega() Booleano
    }
    class Prueba {
        -identificador: Identificador
        -nombre: Texto
        -categoria: CategoriaPrueba
        -obligatoria: Booleano
        -condicionAprobacion: Texto
        -limiteEjecucion: Duracion [0..1]
        +validarDefinicion() Booleano
    }
    class Entrega {
        -identificador: Identificador
        -numeroIntento: Entero
        -momentoEntrega: Momento
        -repositorio: Texto
        -commit: Texto
        -referenciaEjecutable: Texto
    }
    class Evaluacion {
        -identificador: Identificador
        -estadoProcesamiento: EstadoEvaluacion
        -momentoSolicitud: Momento
        -momentoInicio: Momento [0..1]
        -momentoFin: Momento [0..1]
        -versionEvaluador: Texto
        -detalleError: Texto [0..1]
        +iniciar(en: Momento) Vacio
        +finalizar(resultados: ResultadoPrueba[], en: Momento) Vacio
        +registrarFallo(detalle: Texto, en: Momento) Vacio
        +esAprobado() Booleano
    }
    class ResultadoPrueba {
        -condicionEjecucion: CondicionEjecucion
        -aprobada: Booleano [0..1]
        -valorObservado: Decimal [0..1]
        -unidad: Texto [0..1]
        -duracion: Duracion [0..1]
        -detalle: Texto [0..1]
    }
    class Credencial {
        -identificadorPublico: Identificador
        -momentoEmision: Momento
        -contenidoEmitido: Texto
        -huellaContenido: Texto
        +vigente: Booleano (derivado, solo lectura)
        +estaVigente() Booleano
    }
    class RevocacionCredencial {
        -momentoRevocacion: Momento
        -motivo: Texto
    }

    class ServicioSeguridad {
        <<service>>
        +autorizar(actor: Usuario, accion: Texto, recurso: Identificador) Booleano
    }
    class ServicioRetos {
        <<service>>
        +preparar(solicitud: SolicitudReto, actor: Usuario) Reto
        +publicar(reto: Reto, actor: Usuario) Vacio
    }
    class ServicioEvaluacion {
        <<service>>
        +registrarEntrega(entrega: Entrega, actor: Usuario) Vacio
        +solicitar(entrega: Entrega, actor: Usuario) Evaluacion
        +procesar(evaluacion: Evaluacion) Vacio
    }
    class ServicioCertificacion {
        <<service>>
        +emitir(evaluacion: Evaluacion) Credencial
        +revocar(credencial: Credencial, motivo: Texto, actor: Usuario) RevocacionCredencial
        +consultar(identificador: Identificador) Credencial
    }
    class PreparadorIA {
        <<interface>>
        +proponer(solicitud: SolicitudReto) Reto
    }
    class EvaluadorAislado {
        <<interface>>
        +ejecutar(entrega: Entrega, pruebas: Prueba[]) ResultadoPrueba[]
    }

    Usuario "1" -- "0..1" PerfilEstudiante : posee
    Usuario "1" -- "0..1" Representacion : ejerce
    Representacion "0..1" -- "1" Organizacion : es responsable de
    Usuario "1" -- "0..*" EventoAuditoria : origina
    Organizacion "1" -- "0..*" SolicitudReto : presenta
    SolicitudReto "1" -- "0..1" Reto : genera
    Organizacion "1" -- "0..*" Reto : publica
    Usuario "1" -- "0..*" Participacion : realiza
    Reto "1" -- "0..*" Participacion : tiene
    Participacion "1" -- "0..*" Entrega : origina
    Reto "1" -- "0..*" Entrega : recibe
    Reto "1" -- "0..*" Prueba : define
    Entrega "1" -- "1" Evaluacion : recibe
    Evaluacion "1" -- "0..*" ResultadoPrueba : produce
    ResultadoPrueba "0..*" -- "1" Prueba : corresponde
    Evaluacion "1" -- "0..1" Credencial : sustenta
    Usuario "1" -- "0..*" Credencial : conserva
    Credencial "1" -- "0..1" RevocacionCredencial : recibe

    ServicioSeguridad ..> Usuario : autoriza
    ServicioSeguridad ..> EventoAuditoria : consulta
    ServicioRetos ..> PreparadorIA : depende de
    ServicioEvaluacion ..> EvaluadorAislado : depende de
    ServicioCertificacion ..> Evaluacion : consume
```

---

## 9. Integración con Inteligencia Artificial y Servicios Externos

| Servicio | Función dentro de la plataforma |
|---|---|
| **API de modelo de lenguaje** | Motor del Tutor IA; recibe el contexto construido a partir del árbol de sintaxis abstracta y devuelve orientación socrática. |
| **Vercel** | Alojamiento de la capa de presentación. |
| **Railway** | Alojamiento de la capa de servicios y de los trabajadores del entorno de pruebas. |
| **Supabase** | Instancia gestionada de PostgreSQL. |

---

## 10. Seguridad y Trazabilidad

- **Inmutabilidad de la credencial:** La Insignia se calcula como resumen criptográfico SHA-256 de la confirmación de cambios y de las métricas de ejecución; cualquier alteración invalida la verificación pública.
- **Aislamiento de ejecuciones:** Cada envío se evalúa en un contenedor efímero con límites de procesador y memoria; ningún código se ejecuta sobre el servidor.
- **Objetividad de la evaluación:** Se miden exclusivamente competencias técnicas verificables (algoritmos, latencia, concurrencia, perfilado de memoria y calidad del software).

---

## 11. Tecnologías Empleadas

| Capa | Tecnologías |
|---|---|
| **Presentación** | React / Next.js, Tailwind CSS, Monaco Editor |
| **Servicios** | Python, FastAPI (asincronía nativa), Pydantic |
| **Datos** | PostgreSQL, Redis |
| **Entorno de pruebas** | Contenedores Docker efímeros con grupos de control, integración y entrega continuas |
| **Inteligencia artificial** | Modelo de lenguaje externo con caché de indicaciones, análisis de árbol de sintaxis abstracta |
| **Infraestructura** | Vercel, Railway, Supabase |
