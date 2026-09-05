# Critical Cases — Suite de Pruebas Automáticas

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

## Código automatizado

```python
from playwright.sync_api import Page, expect

BASE_URL = "https://TU-URL.com"


def test_critical_invalid_workspace(page: Page):
    """Una ruta inexistente no debe provocar un error interno."""
    response = page.goto(f"{BASE_URL}/workspace/no-existe")

    assert response is not None
    assert response.status < 500


def test_critical_invalid_action(page: Page):
    """Una acción inválida debe ser controlada por la plataforma."""
    page.goto(BASE_URL)

    expect(page.locator("body")).to_be_visible()

    # Este paso se adaptará a la acción crítica real de la aplicación.
    # page.get_by_role("button", name="Entregar").click()
    # expect(page.get_by_text("Completa los campos requeridos")).to_be_visible()
```

## Ejecución

La versión ejecutable de estas pruebas se encuentra en:

```text
tests/test_e2e.py
```

Ejecutar con:

```bash
pytest -v --headed
```

> Los selectores y las rutas se actualizarán con la URL y el comportamiento final de la plataforma.
