# Happy Path — Suite de Prueba Automática

## Objetivo

Validar de extremo a extremo que el flujo principal de la plataforma funciona correctamente desde la URL pública.

## Flujo general

`URL → Plataforma → Workspace → Reto → Acción principal → Resultado`

## Validaciones

- La plataforma carga correctamente.
- El contenido principal es visible.
- El usuario puede acceder a un workspace o reto.
- El flujo principal puede completarse sin errores críticos.
- El sistema permanece estable durante todo el recorrido.

## Resultado esperado

El usuario completa el recorrido principal de la plataforma correctamente y obtiene el resultado esperado sin errores críticos.

## Código automatizado

```python
from playwright.sync_api import Page, expect

BASE_URL = "https://TU-URL.com"


def test_happy_path_general(page: Page):
    """Valida el recorrido principal de la plataforma de extremo a extremo."""
    response = page.goto(BASE_URL)

    assert response is not None
    assert response.status < 500

    # La plataforma debe cargar correctamente.
    expect(page.locator("body")).to_be_visible()

    # Estos pasos se adaptarán al flujo real de la aplicación.
    # workspace = page.get_by_text("Workspace Demo").first
    # expect(workspace).to_be_visible()
    # workspace.click()
    # expect(page.locator("main")).to_be_visible()
```

## Ejecución

La versión ejecutable de esta prueba se encuentra en:

```text
tests/test_e2e.py
```

Ejecutar con:

```bash
pytest -v --headed
```

> El flujo y los selectores se actualizarán con la URL y la interfaz final de la plataforma.
