# ADR-002 — Evaluador y preparador tras puertos, con la implementacion declarada en el dato

- **Estado:** aceptada
- **Fecha:** 2026-09-05
- **Ambito:** backend, evaluacion de entregas, preparacion de retos
- **Decide:** rol de Backend, Cloud DevOps & Database

## Contexto

El diseno del MVP define dos interfaces de integracion: `EvaluadorAislado`, que ejecuta el commit
exacto frente a las pruebas, y `PreparadorIA`, que propone un borrador a partir de material
privado. Construir el aislamiento real —contenedor efimero con limites de CPU y memoria— exige un
ejecutor externo que los planes gratuitos de PaaS no ofrecen, y no cabe en la jornada sin poner en
riesgo el requisito eliminatorio de despliegue.

Al mismo tiempo, presentar un resultado inventado como si procediera de una ejecucion real es un
riesgo directo contra el criterio de calidad tecnica: el jurado audita el repositorio.

## Decision

Los dos puertos se declaran como interfaces y se resuelven por variable de entorno
(`EVALUADOR`, `PREPARADOR`). El MVP entrega dos implementaciones:

| Puerto | Implementacion del MVP | Que hace |
| --- | --- | --- |
| `EvaluadorAislado` | `EvaluadorSimulado` (`simulado:v1`) | Deriva cada resultado de `sha256(commit + id de prueba)`, de forma determinista. No ejecuta el commit |
| `PreparadorIA` | `PreparadorPorReglas` (`reglas:v1`) | Sanea el material por expresiones regulares y propone criterios y bateria. No llama a ningun modelo |

Tres condiciones acompanan a la decision:

1. **La implementacion viaja en el dato.** `Evaluacion.version_evaluador` y
   `SolicitudReto.modelo_ia` se persisten y se devuelven en la API y en la credencial.
   `GET /api/v1/meta` declara que sirve cada puerto.
2. **Nada afirma una ejecucion que no ocurrio.** Ni la interfaz, ni el pitch, ni el README hablan
   de contenedores, de pruebas de estres ni de latencia auditada mientras el evaluador sea
   `simulado:v1`. Lo que se afirma es lo que dice el dato.
3. **Sin retraso artificial.** La evaluacion termina en milisegundos y el estado cambia enseguida.
   Si la interfaz muestra las pruebas apareciendo una a una, esa es una animacion del frontend
   sobre datos ya recibidos, no latencia simulada en el servidor.

## Consecuencias

**A favor**

- El alcance cabe en la jornada sin comprometer el despliegue.
- El determinismo hace reproducible cualquier resultado publicado: el mismo commit arroja siempre
  el mismo dictamen, y quien audite puede comprobarlo.
- La demostracion es ensayable y no depende de la red ni de la carga de la maquina.
- Sustituir cualquiera de los dos por una implementacion real es escribir una clase y cambiar una
  variable de entorno. Ningun servicio ni ninguna ruta cambia.

**En contra**

- El MVP no mide rendimiento real ni ejecuta codigo no confiable. Es una limitacion de alcance
  declarada, no una propiedad oculta.
- La sanitizacion por reglas no garantiza la eliminacion perfecta de secretos. Por eso RN-ING-02
  exige revision humana autorizada antes de publicar, que esta implementada.

## Alternativas descartadas

- **Ejecucion real en contenedor efimero hoy.** Es la meta del producto; requiere un ejecutor
  externo y credenciales adicionales. Riesgo alto de no llegar al limite de la entrega final.
- **Resultados simulados sin declarar la implementacion.** Descartada: si el jurado lee el codigo
  y descubre que la evaluacion no ocurre mientras la interfaz afirma lo contrario, se pierde el
  criterio de mayor peso junto con la credibilidad del resto de la propuesta.

## Seguimiento

El diseno del MVP acota el alcance a "un solo tipo de reto y un solo entorno de ejecucion
soportado". Sobre esa base, un evaluador que ejecute realmente la bateria de un unico reto es
alcanzable despues de la jornada sin tocar el dominio.
