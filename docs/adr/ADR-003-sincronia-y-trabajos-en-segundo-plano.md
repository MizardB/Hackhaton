# ADR-003 — Acceso síncrono a base de datos y evaluación en segundo plano

- **Estado:** aceptada
- **Fecha:** 2026-09-05
- **Ámbito:** backend, persistencia
- **Decide:** rol de Backend, Cloud DevOps & Database

## Contexto

FastAPI admite dos estilos de acceso a datos: SQLAlchemy asíncrono con `asyncpg`, o SQLAlchemy síncrono con `psycopg2` en endpoints declarados con `def`, que FastAPI ejecuta en su grupo de hilos.

El estilo asíncrono es el que sugiere el discurso del producto, pero introduce tres problemas conocidos bajo presión de tiempo: las sesiones no se pueden compartir entre el ciclo de petición y una tarea en segundo plano, mezclar llamadas bloqueantes en una corrutina congela el bucle de eventos sin aviso, y `asyncpg` contra el *pooler* de Supabase en modo transacción exige desactivar la caché de sentencias preparadas.

Por separado, la evaluación de una entrega tarda segundos. Si ocurre dentro del ciclo de petición-respuesta, el frontend queda bloqueado y el proxy del proveedor puede cortar la conexión.

## Decisión

1. **Persistencia síncrona.** SQLAlchemy 2.0 con `psycopg2`, sesión por petición mediante dependencia. Los endpoints se declaran con `def`, no con `async def`, salvo aquellos cuyo trabajo sea exclusivamente esperar a un servicio externo.
2. **Evaluación fuera del ciclo de petición.** `POST /adopciones/{id}/submissions` persiste la entrega con estado `en_cola`, responde `202 Accepted` y encola el trabajo en `BackgroundTasks`. La tarea abre su propia sesión de base de datos.
3. **El estado vive en la base de datos, no en memoria.** La máquina de estados de `SUBMISSION` (`en_cola` → `evaluando` → `aprobado` \| `denegado`) es la única fuente de verdad. El frontend consulta `GET /submissions/{id}` cada 700 ms.
4. **Migraciones con Alembic**, una revisión inicial, más un script de datos de demostración separado.

## Consecuencias

**A favor**

- Se elimina una clase entera de errores difíciles de diagnosticar durante un evento en vivo.
- El estado persistido sobrevive a un reinicio del proceso: una entrega que quedó en `evaluando` es detectable y reencolable, y no se pierde en silencio.
- El *polling* funciona igual en el plan gratuito del proveedor, donde una conexión de larga duración puede cortarse.

**En contra**

- El grupo de hilos limita la concurrencia. Irrelevante para el tráfico de una demostración.
- El *polling* genera peticiones repetidas. Son consultas por clave primaria; el coste es despreciable.
- La tarea en segundo plano muere si el proceso se reinicia a mitad de evaluación. Se acepta: el estado en base de datos permite reintentar, y no se contempla un reinicio durante la demostración.

## Alternativas descartadas

- **SQLAlchemy asíncrono con `asyncpg`.** Coherente con el discurso, pero el coste de depuración durante la jornada supera el beneficio.
- **Celery o RQ con Redis.** Solución correcta en producción; añade un componente de infraestructura y un proceso trabajador que el alcance de hoy no justifica.
- **Evaluación síncrona dentro de la petición.** Bloquea la interfaz y arruina la pantalla de consola en vivo, que es el momento central de la demostración.
