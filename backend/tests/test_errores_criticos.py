"""Casos de error, uno por clase de fallo. Cubren el minimo temático exigido por las bases."""

from tests.conftest import auth, reto_fresco


def test_sin_token_devuelve_401_con_codigo_estable(cliente):
    r = cliente.get("/api/v1/auth/yo")
    assert r.status_code == 401
    assert r.json()["error"]["codigo"] == "CREDENCIALES_INVALIDAS"


def test_token_manipulado_devuelve_401(cliente, estudiante, datos_demo):
    r = cliente.get("/api/v1/auth/yo", headers=auth(estudiante() + "xx"))
    assert r.status_code == 401


def test_payload_invalido_devuelve_422_con_envoltura(cliente):
    r = cliente.post("/api/v1/auth/registro", json={"correo": "no-es-un-correo", "password": "x"})
    assert r.status_code == 422
    assert r.json()["error"]["codigo"] == "VALIDACION"


def test_correo_duplicado_devuelve_409(cliente):
    datos = {"correo": "duplicado@uni.pe", "password": "clave-de-prueba", "nombre": "Duplicado"}
    assert cliente.post("/api/v1/auth/registro", json=datos).status_code == 201
    r = cliente.post("/api/v1/auth/registro", json=datos)
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "CORREO_YA_REGISTRADO"


def test_participar_dos_veces_en_el_mismo_reto_devuelve_409(cliente, estudiante, datos_demo):
    """RN-PART-01."""
    token = estudiante()
    reto_id = reto_fresco(cliente, "Participacion duplicada")
    assert cliente.post(f"/api/v1/retos/{reto_id}/participaciones", headers=auth(token)).status_code == 201
    r = cliente.post(f"/api/v1/retos/{reto_id}/participaciones", headers=auth(token))
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "PARTICIPACION_YA_EXISTE"


def test_un_reto_cerrado_no_admite_entregas(cliente, estudiante, representante, datos_demo):
    """RN-EVAL-04: cerrar bloquea nuevas entregas."""
    token = estudiante()
    reto_id = reto_fresco(cliente, "Reto que se cierra")
    participacion = cliente.post(f"/api/v1/retos/{reto_id}/participaciones", headers=auth(token)).json()

    r = cliente.post(f"/api/v1/retos/{reto_id}/cierre", headers=auth(representante["token"]))
    assert r.status_code == 200
    assert r.json()["estado"] == "CERRADO"

    r = cliente.post(
        f"/api/v1/participaciones/{participacion['id']}/entregas",
        headers=auth(token),
        json={"repositorio": "https://github.com/demo/reto", "commit": "abc123def"},
    )
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "RETO_NO_ADMITE_ENTREGAS"


def test_credencial_inexistente_devuelve_404(cliente):
    r = cliente.get("/api/v1/credenciales/SH-2026-NOEXISTE")
    assert r.status_code == 404
    assert r.json()["error"]["codigo"] == "CREDENCIAL_NO_ENCONTRADA"


def test_publicar_sin_prueba_obligatoria_devuelve_409(cliente, representante, datos_demo):
    import uuid

    from app.core.database import SessionLocal
    from app.dominio.enums import EstadoReto
    from app.models import Reto

    organizacion_id = uuid.UUID(representante["usuario"]["representaciones"][0]["organizacion_id"])
    with SessionLocal() as db:
        reto = Reto(
            organizacion_id=organizacion_id,
            titulo="Sin pruebas",
            descripcion_publica="x",
            criterios_aceptacion="x",
            estado=EstadoReto.BORRADOR,
        )
        db.add(reto)
        db.commit()
        reto_id = str(reto.id)

    r = cliente.post(f"/api/v1/retos/{reto_id}/publicacion", headers=auth(representante["token"]))
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "SIN_PRUEBA_OBLIGATORIA"
