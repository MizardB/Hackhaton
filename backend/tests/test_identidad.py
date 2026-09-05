"""RN-ID-01 y el modelo de permisos por representacion."""

from tests.conftest import CLAVE, auth


def test_una_persona_puede_ser_estudiante_y_representante_a_la_vez(cliente, datos_demo):
    """RN-ID-01: ambas condiciones son compatibles. No hay rol global excluyente."""
    r = cliente.post("/api/v1/auth/login", json={"correo": "carlos@uni.pe", "password": "demo12345"}).json()
    usuario = r["usuario"]
    assert usuario["tiene_perfil_estudiante"] is True
    assert len(usuario["representaciones"]) == 1
    assert usuario["representaciones"][0]["funcion_autorizada"] == "GESTOR_RETOS"


def test_un_usuario_sin_perfil_no_puede_participar(cliente, estudiante, datos_demo):
    """Ser usuario no basta: participar exige perfil de estudiante."""
    token = estudiante(con_perfil=False)
    reto_id = cliente.get("/api/v1/retos").json()["items"][0]["id"]
    r = cliente.post(f"/api/v1/retos/{reto_id}/participaciones", headers=auth(token))
    assert r.status_code == 403
    assert r.json()["error"]["codigo"] == "SIN_PERFIL_ESTUDIANTE"


def test_el_perfil_privado_no_es_consultable(cliente, estudiante, datos_demo):
    """Un perfil privado devuelve 404, no 403: no confirma su existencia."""
    token = estudiante()
    perfil = cliente.get("/api/v1/auth/yo/perfil", headers=auth(token)).json()
    nombre = perfil["nombre_publico"]

    assert cliente.get(f"/api/v1/perfiles/{nombre}").status_code == 200
    cliente.patch("/api/v1/auth/yo/perfil", headers=auth(token), json={"visibilidad": "PRIVADO"})
    assert cliente.get(f"/api/v1/perfiles/{nombre}").status_code == 404


def test_registro_login_y_perfil_propio(cliente):
    correo = "camino.identidad@uni.pe"
    r = cliente.post(
        "/api/v1/auth/registro",
        json={
            "correo": correo,
            "password": CLAVE,
            "nombre": "Camino Identidad",
            "perfil_estudiante": {
                "nombre_publico": "camino-identidad",
                "universidad": "UNI",
                "carrera": "Ingenieria de Sistemas",
                "ciclo": 7,
            },
        },
    )
    assert r.status_code == 201
    assert r.json()["tiene_perfil_estudiante"] is True

    token = cliente.post("/api/v1/auth/login", json={"correo": correo, "password": CLAVE}).json()["access_token"]
    assert cliente.get("/api/v1/auth/yo", headers=auth(token)).json()["correo"] == correo
