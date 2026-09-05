from playwright.sync_api import Page, expect

BASE_URL = "https://TU-URL.com"


def test_happy_path_general(page: Page):
    """Valida el recorrido principal de la plataforma de extremo a extremo."""
    response = page.goto(BASE_URL)

    assert response is not None
    assert response.status < 500

    expect(page.locator("body")).to_be_visible()

    # TODO: adaptar estos pasos a la interfaz real cuando esté definida.
    # Ejemplo:
    # workspace = page.get_by_text("Workspace Demo").first
    # expect(workspace).to_be_visible()
    # workspace.click()
    # expect(page.locator("main")).to_be_visible()


def test_critical_invalid_workspace(page: Page):
    """Una ruta inexistente no debe provocar un error interno."""
    response = page.goto(f"{BASE_URL}/workspace/no-existe")

    assert response is not None
    assert response.status < 500


def test_critical_invalid_action(page: Page):
    """Una acción inválida debe ser controlada por la plataforma."""
    page.goto(BASE_URL)

    expect(page.locator("body")).to_be_visible()

    # TODO: adaptar a una acción crítica real de la plataforma.
    # Ejemplo:
    # page.get_by_role("button", name="Entregar").click()
    # expect(page.get_by_text("Completa los campos requeridos")).to_be_visible()
