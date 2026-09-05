# Contrato de la API — Skill Hub

Prefijo: `/api/v1`. Los nombres de rutas, campos y estados corresponden uno a uno con el modelo
de datos del MVP (`docs/modelo-datos.md`). La documentacion navegable la genera FastAPI en `/docs`.

---

## 1. Convenciones

**Autenticacion.** `Authorization: Bearer <jwt>`. Sin cookies: el frontend estatico vive en otro
origen.

**Permisos.** No hay rol global. Lo que una cuenta puede hacer se deriva de dos cosas (RN-ID-01):

- tener **perfil de estudiante**, para participar, entregar y reevaluar;
- tener una **representacion activa** sobre una organizacion, con `funcion_autorizada`
  (`GESTOR_RETOS`, `REVOCADOR` o `GESTOR_Y_REVOCADOR`), para solicitar, publicar, cerrar y revocar.

Una misma persona puede tener ambas. `GET /auth/yo` devuelve las dos cosas.

**Errores.** Envoltura unica. Conviene ramificar sobre `codigo`, que es estable:

```json
{ "error": { "codigo": "PARTICIPACION_YA_CERTIFICADA", "mensaje": "…", "detalles": {} } }
```

| HTTP | Cuando |
| --- | --- |
| 200 / 201 | Lectura correcta / recurso creado |
| 202 | Trabajo aceptado y encolado (preparacion con IA, evaluacion) |
| 401 | Token ausente, expirado o invalido |
| 403 | Falta perfil de estudiante o representacion suficiente |
| 404 | No existe, o no es visible para quien pregunta |
| 409 | Conflicto de estado o de regla de negocio |
| 422 | Validacion del esquema |

Un recurso ajeno devuelve **404 y no 403**: no se confirma su existencia a quien no es su dueno.

**Propiedades derivadas.** `condicion_certificacion` y `vigente` se calculan en cada consulta; no
son columnas. Su valor puede cambiar sin que nadie edite la credencial.

---

## 2. Sistema

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/health` | — | Estado del servicio; ejecuta `SELECT 1` |
| GET | `/api/v1/meta` | — | Version, commit desplegado y **que implementacion sirve cada puerto** |

`meta` declara `evaluador` y `preparador`. Es transparencia deliberada: quien lea un resultado
sabe que lo produjo.

---

## 3. Identidad

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/auth/registro` | — | Alta de usuario; `perfil_estudiante` es opcional |
| POST | `/auth/login` | — | Devuelve el token, el usuario y sus representaciones activas |
| GET | `/auth/yo` | Bearer | Usuario actual |
| GET | `/auth/yo/perfil` | Bearer | Perfil de estudiante propio |
| PATCH | `/auth/yo/perfil` | Bearer | Nombre publico, biografia y visibilidad |

---

## 4. Catalogo de retos

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/retos` | — | Catalogo publico paginado (`estado`, `organizacion_id`, `q`) |
| GET | `/retos/{reto_id}` | — | Detalle con criterios de aceptacion y la bateria de pruebas |

Los borradores no aparecen en el catalogo ni son consultables por esta via: devuelven 404.
De `PRUEBA` se expone `nombre`, `categoria`, `obligatoria`, `condicion_aprobacion` y
`limite_ejecucion_ms`; `referencia_ejecutable` es detalle interno y no sale.

---

## 5. Ingesta y preparacion (portal de la organizacion)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/solicitudes` | representacion | Registra la solicitud y encola la preparacion. **202** |
| GET | `/solicitudes/{id}` | representacion | Estado de la preparacion y borrador generado |
| GET | `/retos/{id}/borrador` | representacion | Revisa el borrador antes de publicar |
| PATCH | `/retos/{id}` | representacion | Corrige el texto propuesto (solo en borrador) |
| POST | `/retos/{id}/publicacion` | representacion | Publica tras la revision humana |
| POST | `/retos/{id}/cierre` | representacion | Cierra el reto |

`contenido_original_restringido` **nunca** se expone (RN-ING-01). Lo que se devuelve es
`resumen_preparacion`, `modelo_ia` y `version_instrucciones`.

RN-ING-02: la salida de la IA es un borrador. Publicar exige revision humana autorizada, y al
menos una prueba obligatoria.

---

## 6. Participacion, entrega y evaluacion

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/retos/{id}/participaciones` | estudiante | Participa en el reto |
| GET | `/participaciones/mias` | estudiante | Participaciones propias |
| GET | `/participaciones/{id}` | dueno | Detalle con `condicion_certificacion` y `admite_entrega` |
| POST | `/participaciones/{id}/entregas` | dueno | Registra la entrega y solicita su evaluacion. **202** |
| GET | `/participaciones/{id}/entregas` | dueno | Historial de intentos con sus evaluaciones |
| POST | `/entregas/{id}/evaluaciones` | dueno | **Reevalua la misma entrega.** 202 |
| GET | `/evaluaciones/{id}` | dueno | Estado, resultados y credencial emitida |

Una entrega referencia `repositorio` y `commit`; el codigo no se envia por la API.

**RN-EVAL-01:** una entrega admite muchas evaluaciones. `POST /entregas/{id}/evaluaciones` es
tambien la via de recertificacion tras una revocacion.

**Flujo asincrono.** El envio responde `202` con `evaluacion_id` y la cabecera `Location`. La
pantalla consulta `GET /evaluaciones/{id}` cada 700 ms hasta que `estado_procesamiento` deja de
ser `PENDIENTE` o `EN_EJECUCION`. Mientras corre, `progreso` cuenta pruebas realmente persistidas.

**Estados y dictamen.** `estado_procesamiento` ∈ `PENDIENTE | EN_EJECUCION | FINALIZADA |
ERROR_TECNICO`. `dictamen` ∈ `APROBADO | NO_APROBADO`, y **esta ausente** cuando no hay dictamen
valido, incluido el error de infraestructura (RN-EVAL-03). Un `ERROR_TECNICO` no es una solucion
desaprobada y no permite emitir.

Cada resultado lleva `condicion_ejecucion` (`EJECUTADA | NO_EJECUTADA | ERROR_TECNICO`); `aprobada`
solo se informa para una comprobacion efectivamente ejecutada.

Aprobar exige la bateria completa y **todas** las pruebas obligatorias superadas.

---

## 7. Credenciales

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/credenciales/{identificador_publico}` | — | Consulta publica; el reclutador no necesita cuenta |
| POST | `/credenciales/{identificador_publico}/revocacion` | representacion con `REVOCADOR` | Revoca |

La emision **no es una accion expuesta**: la dispara el servicio de evaluacion al aprobar
(seccion 5 del diseno). El emisor se deriva de la organizacion responsable del reto.

La respuesta se arma desde `contenido_emitido`, que conserva la presentacion historica: cambiar el
nombre del perfil o el titulo del reto no altera una credencial ya emitida. `huella_contenido` es
el SHA-256 de ese contenido e informa por separado de la vigencia.

Ser dueno del perfil no concede permiso para revocar. Una credencial revocada permanece
registrada y consultable, con `vigente: false` y el motivo (RN-CRED-05).

---

## 8. Perfil publico

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/perfiles/{nombre_publico}` | — | Perfil publicado con sus credenciales |

Un perfil `PRIVADO` devuelve 404, no 403.

---

## 9. Cobertura de la suite automatica

Las cinco pruebas que pide la seccion 6 del diseno, mas el minimo tematico de las bases:

| Prueba | Comprueba |
| --- | --- |
| Camino feliz | Participacion, entrega, evaluacion aprobada, emision y consulta publica |
| Error critico | Nadie evalua ni consulta la entrega de otra persona |
| Fallo de evaluacion | `ERROR_TECNICO` deja la evaluacion sin dictamen y no emite |
| Unicidad de emision | Solicitudes repetidas no generan dos credenciales vigentes |
| Reversa y recertificacion | Revocar conserva historial; solo una evaluacion posterior recertifica |

Mas los errores por clase: 401 sin token, 422 de esquema, 409 de regla de negocio y 404 de recurso
ajeno o inexistente.
