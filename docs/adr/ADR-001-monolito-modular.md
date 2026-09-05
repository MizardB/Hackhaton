# ADR-001 — Monolito modular con puertos en lugar de servicios separados

- **Estado:** aceptada
- **Fecha:** 2026-09-05
- **Ámbito:** backend
- **Decide:** rol de Backend, Cloud DevOps & Database

## Contexto

El diagrama de contenedores de la propuesta sitúa el AI Scoper y el Evaluation Runner al mismo nivel que la API y la base de datos, lo que sugiere procesos desplegables por separado. La jornada de desarrollo dura siete horas y existe un requisito eliminatorio de URL de producción activa antes de las 16:30.

Cada servicio adicional cuesta un despliegue, un conjunto de variables de entorno, un contrato de red y una superficie de fallo nueva. En paralelo, el criterio de Ingeniería de Software y Calidad Técnica (30%) evalúa arquitectura desacoplada.

## Decisión

Un único servicio FastAPI desplegable, organizado en módulos de dominio (`auth`, `catalogo`, `ingesta`, `entregas`, `certificacion`, `perfil_publico`). El Scoper y el Evaluador se definen como **puertos** (`ScoperPort`, `EvaluatorPort`), con implementaciones intercambiables por variable de entorno.

El desacoplamiento se demuestra mediante la interfaz y la sustituibilidad de la implementación, no mediante la separación de procesos.

## Consecuencias

**A favor**

- Un solo despliegue que vigilar, un solo conjunto de secretos, un solo registro de logs.
- El criterio de desacoplamiento se satisface de forma verificable: existen dos implementaciones de `EvaluatorPort` y dos de `ScoperPort` en el repositorio, y se conmutan sin tocar los módulos de dominio.
- Extraer un puerto a un servicio propio más adelante no exige reescribir los llamadores.

**En contra**

- Una evaluación pesada consume recursos del mismo proceso que atiende las peticiones HTTP. Se mitiga con el límite de una entrega en curso por adopción y con el `timeout` del evaluador.
- No hay escalado independiente del motor de evaluación. Fuera del alcance de la jornada.

## Alternativas descartadas

- **Microservicios con cola de mensajes.** Aporta escalado real y aísla fallos, pero exige un broker, dos despliegues extra y un contrato entre servicios. No cabe en la jornada y no añade puntaje sobre la solución adoptada.
- **Funciones serverless para la evaluación.** Arranque en frío impredecible y depuración costosa durante un evento en vivo.
