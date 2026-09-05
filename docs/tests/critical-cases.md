# Critical Cases

## Objetivo

Validar que los fallos críticos sean manejados correctamente sin provocar una caída de la plataforma.

## Caso 1 — Workspace o ruta inexistente

### Escenario

El usuario intenta acceder a un workspace, reto o ruta que no existe.

### Resultado esperado

La plataforma debe manejar el error correctamente y no devolver un error interno del servidor.

## Caso 2 — Acción crítica inválida

### Escenario

El usuario intenta ejecutar una acción principal con datos incompletos, inválidos o sin cumplir los requisitos necesarios.

### Resultado esperado

La plataforma debe bloquear o manejar la acción correctamente sin romper el flujo general del sistema.

## Automatización

Estos casos se ejecutan desde:

```text
tests/test_e2e.py
```
