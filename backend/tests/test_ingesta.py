"""Flujo del PreparadorIA: solicitud privada -> borrador -> revision humana -> publicacion."""

from tests.conftest import auth, esperar  # noqa: F401


def _esperar_preparacion(cliente, token, solicitud_id, intentos=40):
    import time

    for _ in range(intentos):
        cuerpo = cliente.get(f"/api/v1/solicitudes/{solicitud_id}", headers=auth(token)).json()
        if cuerpo["estado_preparacion"] in ("LISTA", "ERROR"):
            return cuerpo
        time.sleep(0.05)
    raise AssertionError("la preparacion no termino a tiempo")


def test_la_solicitud_produce_un_borrador_que_exige_revision(cliente, representante, datos_demo):
    token = representante["token"]
    organizacion_id = representante["usuario"]["representaciones"][0]["organizacion_id"]

    r = cliente.post(
        "/api/v1/solicitudes",
        headers=auth(token),
        json={
            "organizacion_id": organizacion_id,
            "titulo_original": "Cobros duplicados en el endpoint de pagos",
            "contenido_original": (
                "El servicio interno en 10.0.4.12 duplica cobros.\n"
                "api_key=sk-super-secreta-1234\n"
                "Contacto: soporte.interno@banco-demo.pe\n"
                "postgres://usuario:clave@bd-interna:5432/pagos"
            ),
        },
    )
    assert r.status_code == 202
    solicitud_id = r.json()["id"]

    solicitud = _esperar_preparacion(cliente, token, solicitud_id)
    assert solicitud["estado_preparacion"] == "LISTA"
    assert solicitud["modelo_ia"] == "reglas:v1"
    assert solicitud["version_instrucciones"]
    assert solicitud["resumen_preparacion"]
    # RN-ING-01: el contenido original nunca sale por la API.
    assert "contenido_original" not in solicitud
    assert "sk-super-secreta" not in str(solicitud)

    reto_id = solicitud["reto_borrador_id"]
    assert reto_id

    # El borrador no aparece en el catalogo publico.
    publicos = [x["id"] for x in cliente.get("/api/v1/retos").json()["items"]]
    assert reto_id not in publicos
    assert cliente.get(f"/api/v1/retos/{reto_id}").status_code == 404

    # El representante si lo ve, y el texto propuesto va saneado.
    borrador = cliente.get(f"/api/v1/retos/{reto_id}/borrador", headers=auth(token)).json()
    assert borrador["estado"] == "BORRADOR"
    assert "[REDACTADO]" in borrador["descripcion_publica"]
    for secreto in ("sk-super-secreta-1234", "10.0.4.12", "soporte.interno@banco-demo.pe"):
        assert secreto not in borrador["descripcion_publica"]
    assert borrador["pruebas_obligatorias"] >= 1

    # RN-ING-02: la revision humana puede corregir antes de publicar.
    cliente.patch(
        f"/api/v1/retos/{reto_id}", headers=auth(token), json={"titulo": "Idempotencia en cobros con reintentos"}
    )

    r = cliente.post(f"/api/v1/retos/{reto_id}/publicacion", headers=auth(token))
    assert r.status_code == 200
    assert r.json()["estado"] == "PUBLICADO"
    assert r.json()["titulo"] == "Idempotencia en cobros con reintentos"

    assert reto_id in [x["id"] for x in cliente.get("/api/v1/retos").json()["items"]]


def test_sin_representacion_no_se_registra_una_solicitud(cliente, estudiante, representante, datos_demo):
    """RN-ORG-01: actuar por la organizacion exige representacion habilitada."""
    token = estudiante()
    organizacion_id = representante["usuario"]["representaciones"][0]["organizacion_id"]
    r = cliente.post(
        "/api/v1/solicitudes",
        headers=auth(token),
        json={
            "organizacion_id": organizacion_id,
            "titulo_original": "Intento no autorizado",
            "contenido_original": "x",
        },
    )
    assert r.status_code == 403
    assert r.json()["error"]["codigo"] == "REPRESENTACION_INSUFICIENTE"


def test_la_denegacion_queda_en_la_bitacora(cliente, estudiante, representante, datos_demo):
    """RN-AUD-01: las denegaciones relevantes tambien se registran."""
    from sqlalchemy import select

    from app.core.database import SessionLocal
    from app.models import EventoAuditoria

    token = estudiante()
    organizacion_id = representante["usuario"]["representaciones"][0]["organizacion_id"]
    cliente.post(
        "/api/v1/solicitudes",
        headers=auth(token),
        json={
            "organizacion_id": organizacion_id,
            "titulo_original": "Otro intento",
            "contenido_original": "x",
        },
    )

    with SessionLocal() as db:
        evento = db.scalar(
            select(EventoAuditoria)
            .where(EventoAuditoria.resultado == "DENEGADA")
            .order_by(EventoAuditoria.momento.desc())
        )
    assert evento is not None
    assert evento.usuario_id is not None  # origen USUARIO exige actor
    assert evento.origen == "USUARIO"
    assert evento.referencia_recurso.startswith("organizacion:")
