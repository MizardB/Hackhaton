# Verificacion de encaje con el modelo de datos del MVP

Contraste entre `Diseno_MVP_Skill_Hub.md` (14 entidades, 20 clasificadores UML) y el backend
implementado. Comprobado sobre el codigo y sobre el esquema migrado, no sobre la documentacion.

---

## 1. Entidades

| Modelo | Tabla | Estado |
| --- | --- | --- |
| `USUARIO` | `usuario` | Implementada |
| `PERFIL_ESTUDIANTE` | `perfil_estudiante` | Implementada, identificada por su usuario |
| `ORGANIZACION` | `organizacion` | Implementada |
| `REPRESENTACION` | `representacion` | Implementada, identificada por la pareja usuario-organizacion |
| `SOLICITUD_RETO` | `solicitud_reto` | Implementada, con la preparacion plegada segun RN-ING-03 |
| `RETO` | `reto` | Implementada |
| `PRUEBA` | `prueba` | Implementada, conjunto plano por reto |
| `PARTICIPACION` | `participacion` | Implementada, unica por perfil y reto |
| `ENTREGA` | `entrega` | Implementada, con repositorio y commit |
| `EVALUACION` | `evaluacion` | Implementada, N por entrega |
| `RESULTADO_PRUEBA` | `resultado_prueba` | Implementada, identificada por evaluacion-prueba |
| `CREDENCIAL` | `credencial` | Implementada |
| `REVOCACION_CREDENCIAL` | `revocacion_credencial` | Implementada, identificada por la credencial |
| `EVENTO_AUDITORIA` | `evento_auditoria` | Implementada |

**14 de 14.** Ninguna tabla adicional, ningun atributo del alcance ausente. El esquema migrado
contiene exactamente esas catorce tablas y las 18 relaciones del E-R.

## 2. Clasificadores de aplicacion

| UML | Modulo |
| --- | --- |
| `ServicioSeguridad` | `app/servicios/seguridad.py` |
| `ServicioRetos` | `app/servicios/retos.py` |
| `ServicioEvaluacion` | `app/servicios/evaluacion.py` |
| `ServicioCertificacion` | `app/servicios/certificacion.py` |
| `PreparadorIA` | `app/servicios/puertos.py`, implementado por `preparador_reglas.py` |
| `EvaluadorAislado` | `app/servicios/puertos.py`, implementado por `evaluador_simulado.py` |

`app/servicios/auditoria.py` implementa RN-AUD-01, que el UML no dibuja como servicio propio.

## 3. Reglas de negocio

| Regla | Donde se cumple |
| --- | --- |
| RN-ID-01 | Sin rol global: perfil y representaciones son independientes. `test_identidad` |
| RN-ORG-01 | `seguridad.exigir_gestion_de_retos` sobre la representacion activa |
| RN-ING-01 | `contenido_original_restringido` no se expone en ningun esquema de salida |
| RN-ING-02 | Publicar exige representacion y al menos una prueba obligatoria. `test_ingesta` |
| RN-ING-03 | Preparacion plegada sobre la solicitud; los fallos dejan evento saneado |
| RN-RETO-01 | `PATCH /retos/{id}` solo actua sobre borradores |
| RN-PART-01 | `UniqueConstraint(perfil, reto)` |
| RN-PART-02 | `UniqueConstraint(participacion, numero_intento)`; el codigo no se reemplaza |
| RN-PART-03 | `registrar_entrega` exige reto habilitado y ausencia de credencial vigente |
| RN-EVAL-01 | `evaluacion.entrega_id` sin restriccion de unicidad. `POST /entregas/{id}/evaluaciones` |
| RN-EVAL-02 | Clave primaria compuesta de `resultado_prueba` |
| RN-EVAL-03 | `_dictaminar` exige bateria completa y obligatorias; `FalloEvaluador` deja `ERROR_TECNICO` sin dictamen |
| RN-EVAL-04 | `Reto.admite_entregas`; una evaluacion ya iniciada termina igual |
| RN-CRED-01 a 08 | `servicios/certificacion.py`, con las precondiciones antes de emitir |
| RN-REV-01, 02 | `revocacion_credencial` con clave primaria en la credencial; revocar no reabre el reto |
| RN-AUD-01 | `servicios/auditoria.py`, invocado en publicacion, evaluacion, emision, revocacion y denegaciones |
| PC-CERT-01 | `emitir` toma la participacion con `SELECT … FOR UPDATE` antes de comprobar y emitir |

Estados derivados —`vigente` y `condicion_certificacion`— se calculan en cada consulta y no
existen como columnas.

## 4. Suite automatica

Las cinco pruebas de la seccion 6 del diseno estan implementadas en
`tests/test_flujo_certificacion.py`, mas identidad, ingesta y errores por clase.

| Prueba del diseno | Archivo |
| --- | --- |
| Camino feliz | `test_camino_feliz_de_participacion_a_credencial` |
| Error critico | `test_nadie_evalua_la_entrega_de_otra_persona` |
| Fallo de evaluacion | `test_un_fallo_del_evaluador_no_permite_emitir` |
| Unicidad de emision | `test_no_se_emiten_dos_credenciales_vigentes` |
| Reversa y recertificacion | `test_revocar_conserva_historial_y_solo_recertifica_una_evaluacion_posterior` |

## 5. Diferencias que quedan, y por que

| Punto | Estado |
| --- | --- |
| `hash_password`, `momento_alta` en `USUARIO` | Anadidos. El E-R conceptual no modela la autenticacion; sin ellos no hay login |
| `limite_ejecucion` como `limite_ejecucion_ms` | El dominio conceptual `Duracion` se materializa en enteros de milisegundos |
| `valor_observado` como `Numeric(12,3)` | Materializacion del dominio `Decimal` |
| Evaluador y preparador | Implementaciones simuladas tras los puertos, declaradas en el dato. Ver ADR-002 |

Ninguna de las cuatro cambia una entidad, una cardinalidad ni una regla. Las tres primeras son
materializaciones de dominios conceptuales, que el propio diseno anticipa cuando advierte que
`Texto`, `Momento` o `Duracion` no son tipos de PostgreSQL. La cuarta es una decision de alcance
documentada.

## 6. Resultado

Las 14 entidades, sus atributos, las 18 relaciones, los 6 clasificadores de aplicacion y las 24
reglas de negocio estan implementados y cubiertos por pruebas. El backend desplegado y los dos
diagramas entregados describen el mismo sistema.
