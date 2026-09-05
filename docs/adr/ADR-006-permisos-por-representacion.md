# ADR-006 — Permisos derivados de la representacion, no de un rol global

- **Estado:** aceptada
- **Fecha:** 2026-09-05
- **Ambito:** backend, autorizacion
- **Decide:** rol de Backend, Cloud DevOps & Database

## Contexto

La primera version del backend guardaba un campo `rol` en el usuario con valores
`estudiante | sponsor | admin`, y las rutas se protegian con dependencias `solo_estudiante` y
`solo_sponsor`. Es la forma mas rapida de proteger endpoints.

El modelo de datos del MVP la rechaza de forma explicita: introduce la entidad `REPRESENTACION`
para "evitar el rol global excluyente", y RN-ID-01 establece que un usuario tiene como maximo un
perfil estudiante **y** puede representar varias organizaciones, siendo ambas condiciones
compatibles.

El caso no es hipotetico: en un piloto universitario, quien coordina los retos de una facultad
puede ser tambien estudiante de otra.

## Decision

No existe rol global. La autorizacion se deriva de dos hechos independientes:

- **Perfil de estudiante propio**, para participar, entregar y solicitar reevaluacion.
- **Representacion activa** sobre una organizacion concreta, con `funcion_autorizada`
  (`GESTOR_RETOS`, `REVOCADOR`, `GESTOR_Y_REVOCADOR`), para registrar solicitudes, publicar,
  cerrar y revocar.

`ServicioSeguridad` concentra esas comprobaciones. Ser dueno del perfil no concede permiso para
emitir ni revocar credenciales. El token JWT identifica a la persona y nada mas: no lleva permisos,
de modo que finalizar una representacion surte efecto de inmediato sin esperar a que expire.

Una consulta sobre un recurso ajeno devuelve **404 y no 403**, para no confirmar su existencia.
Las denegaciones relevantes quedan en la bitacora (RN-AUD-01).

## Consecuencias

**A favor**

- Una misma cuenta puede ser estudiante y representante, como exige RN-ID-01.
- El permiso es por organizacion: representar a una no da permiso sobre los retos de otra.
- Revocar el acceso de alguien es finalizar su representacion, sin tocar su cuenta ni su perfil.

**En contra**

- Cada operacion de organizacion consulta la representacion: una lectura mas por peticion, sobre
  clave primaria compuesta. Despreciable.
- La autorizacion no se lee de un vistazo en el token; hay que ir al servicio de seguridad. A
  cambio, la regla vive en un solo lugar.

## Alternativas descartadas

- **Rol global en el usuario.** Mas simple, pero incompatible con RN-ID-01 y con el modelo
  entregado como documentacion.
- **Permisos dentro del token.** Evita la consulta, pero un token vigente conservaria permisos ya
  retirados hasta expirar.
