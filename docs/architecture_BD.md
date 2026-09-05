# Arquitectura de Base de Datos

Modelo de datos. Este documento contiene los
diagramas conceptuales del proyecto: el esquema entidad-relación y el
diagrama de clases del backend.

> **Alcance:** los tipos SQL, claves foráneas e índices quedan fuera de estos
> diagramas, por corresponder a la fase de implementación.

---

## 1. Diagrama Entidad-Relación Conceptual

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

## 2. Clases UML del Backend

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