# Happy Path

## Objetivo

Validar de extremo a extremo que el flujo principal de la plataforma funciona correctamente desde la URL pública.

## Flujo general

`URL → Plataforma → Workspace → Reto → Acción principal → Resultado`

## Validaciones

- La plataforma carga correctamente.
- El contenido principal es visible.
- El usuario puede acceder a un workspace o reto.
- El flujo principal puede completarse sin errores críticos.

## Resultado esperado

El usuario completa el recorrido principal de la plataforma correctamente y el sistema permanece estable.

## Automatización

La ejecución automática de este flujo se encuentra en:

```text
tests/test_e2e.py
```

Se ejecuta con:

```bash
pytest -v --headed
```
