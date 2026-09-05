"""Las cinco pruebas que exige la seccion 6 del diseno del MVP, mas el minimo de las bases.

| Prueba                   | Resultado que comprueba                                          |
| Camino feliz             | Participacion, entrega, evaluacion aprobada y emision            |
| Error critico            | Nadie evalua la entrega de otra persona                          |
| Fallo de evaluacion      | Error tecnico deja la evaluacion sin dictamen y no emite         |
| Unicidad de emision      | Solicitudes repetidas no generan dos credenciales vigentes       |
| Reversa y recertificacion| Revocar conserva historial; solo una evaluacion posterior sirve  |
"""

from tests.conftest import auth, commit_que_aprueba, esperar, reto_fresco

REPO = "https://github.com/demo/reto"


def _participar(cliente, token, reto_id) -> str:
    r = cliente.post(f"/api/v1/retos/{reto_id}/participaciones", headers=auth(token))
    assert r.status_code == 201, r.text
    return r.json()["id"]


# --------------------------------------------------------------- 1. camino feliz


def test_camino_feliz_de_participacion_a_credencial(cliente, estudiante, datos_demo):
    token = estudiante()
    reto_id = reto_fresco(cliente, "Camino feliz")
    participacion_id = _participar(cliente, token, reto_id)

    p = cliente.get(f"/api/v1/participaciones/{participacion_id}", headers=auth(token)).json()
    assert p["condicion_certificacion"] == "EN_PROGRESO"
    assert p["admite_entrega"] is True

    commit = commit_que_aprueba(cliente, token, participacion_id)

    entregas = cliente.get(f"/api/v1/participaciones/{participacion_id}/entregas", headers=auth(token)).json()
    aprobada = next(e for e in entregas if e["commit"] == commit)
    evaluacion = esperar(cliente, token, aprobada["evaluaciones"][0])

    assert evaluacion["dictamen"] == "APROBADO"
    assert evaluacion["estado_procesamiento"] == "FINALIZADA"
    # La version del evaluador viaja siempre: nada afirma una ejecucion que no ocurrio.
    assert evaluacion["version_evaluador"] == "simulado:v1"
    assert all(r["condicion_ejecucion"] == "EJECUTADA" for r in evaluacion["resultados"])
    assert all(r["aprobada"] for r in evaluacion["resultados"] if r["obligatoria"])

    identificador = evaluacion["credencial"]["identificador_publico"]
    assert evaluacion["credencial"]["vigente"] is True

    # La credencial es publica: el reclutador la verifica sin cuenta.
    c = cliente.get(f"/api/v1/credenciales/{identificador}")
    assert c.status_code == 200
    credencial = c.json()
    assert credencial["vigente"] is True
    assert credencial["emisor"] == "Banco Demo"
    assert credencial["commit"] == commit
    assert len(credencial["huella_contenido"]) == 64

    p = cliente.get(f"/api/v1/participaciones/{participacion_id}", headers=auth(token)).json()
    assert p["condicion_certificacion"] == "CERTIFICADA"
    assert p["admite_entrega"] is False


# --------------------------------------------------------------- 2. error critico


def test_nadie_evalua_la_entrega_de_otra_persona(cliente, estudiante, datos_demo):
    """Error critico exigido: se rechaza la operacion y no se registra evaluacion ajena."""
    duena = estudiante()
    reto_id = reto_fresco(cliente, "Entrega ajena")
    participacion_id = _participar(cliente, duena, reto_id)
    entrega = cliente.post(
        f"/api/v1/participaciones/{participacion_id}/entregas",
        headers=auth(duena),
        json={"repositorio": REPO, "commit": "abc123def456"},
    ).json()
    esperar(cliente, duena, entrega["evaluacion_id"])

    intrusa = estudiante()
    r = cliente.post(f"/api/v1/entregas/{entrega['entrega_id']}/evaluaciones", headers=auth(intrusa))
    assert r.status_code == 404  # no confirma siquiera que la entrega exista
    assert r.json()["error"]["codigo"] == "PARTICIPACION_NO_ENCONTRADA"

    assert cliente.get(f"/api/v1/evaluaciones/{entrega['evaluacion_id']}", headers=auth(intrusa)).status_code == 404
    assert cliente.get(f"/api/v1/participaciones/{participacion_id}", headers=auth(intrusa)).status_code == 404


# --------------------------------------------------------------- 3. fallo del evaluador


def test_un_fallo_del_evaluador_no_permite_emitir(cliente, estudiante, datos_demo):
    """RN-EVAL-03: el fallo del entorno se distingue de una solucion desaprobada."""
    token = estudiante()
    reto_id = reto_fresco(cliente, "Fallo de entorno")
    participacion_id = _participar(cliente, token, reto_id)

    r = cliente.post(
        f"/api/v1/participaciones/{participacion_id}/entregas",
        headers=auth(token),
        json={"repositorio": REPO, "commit": "fallo-de-entorno"},
    )
    final = esperar(cliente, token, r.json()["evaluacion_id"])

    assert final["estado_procesamiento"] == "ERROR_TECNICO"
    assert final["dictamen"] is None  # sin dictamen valido
    assert final["detalle_error"]
    assert final["credencial"] is None

    p = cliente.get(f"/api/v1/participaciones/{participacion_id}", headers=auth(token)).json()
    assert p["condicion_certificacion"] == "EN_PROGRESO"


# --------------------------------------------------------------- 4. unicidad de emision


def test_no_se_emiten_dos_credenciales_vigentes(cliente, estudiante, datos_demo):
    """PC-CERT-01 y RN-CRED-04: una participacion conserva como maximo una credencial vigente."""
    token = estudiante()
    reto_id = reto_fresco(cliente, "Unicidad de emision")
    participacion_id = _participar(cliente, token, reto_id)
    commit_que_aprueba(cliente, token, participacion_id)

    # Reintentar una entrega tras certificar queda bloqueado en el servicio (RN-PART-03).
    r = cliente.post(
        f"/api/v1/participaciones/{participacion_id}/entregas",
        headers=auth(token),
        json={"repositorio": REPO, "commit": "otro-commit-1"},
    )
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "PARTICIPACION_YA_CERTIFICADA"

    entregas = cliente.get(f"/api/v1/participaciones/{participacion_id}/entregas", headers=auth(token)).json()
    r = cliente.post(f"/api/v1/entregas/{entregas[0]['id']}/evaluaciones", headers=auth(token))
    assert r.status_code == 409

    from app.core.database import SessionLocal
    from app.servicios import certificacion

    with SessionLocal() as db:
        import uuid as _uuid

        vigentes = [c for c in certificacion.credenciales_de(db, _uuid.UUID(participacion_id)) if c.esta_vigente()]
    assert len(vigentes) == 1


# --------------------------------------------------------------- 5. reversa y recertificacion


def test_revocar_conserva_historial_y_solo_recertifica_una_evaluacion_posterior(
    cliente, estudiante, representante, datos_demo
):
    token = estudiante()
    reto_id = reto_fresco(cliente, "Reversa y recertificacion")
    participacion_id = _participar(cliente, token, reto_id)
    commit = commit_que_aprueba(cliente, token, participacion_id)

    entregas = cliente.get(f"/api/v1/participaciones/{participacion_id}/entregas", headers=auth(token)).json()
    entrega = next(e for e in entregas if e["commit"] == commit)
    primera = esperar(cliente, token, entrega["evaluaciones"][0])
    identificador = primera["credencial"]["identificador_publico"]

    # Ser dueno del perfil no concede permiso para revocar.
    r = cliente.post(f"/api/v1/credenciales/{identificador}/revocacion", headers=auth(token), json={"motivo": "prueba"})
    assert r.status_code == 403
    assert r.json()["error"]["codigo"] == "REPRESENTACION_INSUFICIENTE"

    r = cliente.post(
        f"/api/v1/credenciales/{identificador}/revocacion",
        headers=auth(representante["token"]),
        json={"motivo": "Se detecto un error en la bateria del reto."},
    )
    assert r.status_code == 201
    revocada = r.json()
    assert revocada["vigente"] is False
    assert revocada["revocacion"]["motivo"]

    # RN-CRED-05: permanece registrada y consultable, no desaparece.
    publica = cliente.get(f"/api/v1/credenciales/{identificador}").json()
    assert publica["vigente"] is False
    assert publica["momento_emision"]

    p = cliente.get(f"/api/v1/participaciones/{participacion_id}", headers=auth(token)).json()
    assert p["condicion_certificacion"] == "REQUIERE_RECERTIFICACION"
    assert p["admite_entrega"] is True

    # RN-CRED-06: una nueva evaluacion de la MISMA entrega si puede recertificar.
    r = cliente.post(f"/api/v1/entregas/{entrega['id']}/evaluaciones", headers=auth(token))
    assert r.status_code == 202
    segunda = esperar(cliente, token, r.json()["evaluacion_id"])
    assert segunda["dictamen"] == "APROBADO"  # determinista: mismo commit, mismo resultado
    assert segunda["credencial"]["vigente"] is True
    assert segunda["credencial"]["identificador_publico"] != identificador

    p = cliente.get(f"/api/v1/participaciones/{participacion_id}", headers=auth(token)).json()
    assert p["condicion_certificacion"] == "CERTIFICADA"


def test_una_evaluacion_anterior_a_la_revocacion_no_recertifica(cliente, estudiante, representante, datos_demo):
    """RN-CRED-06 en su forma negativa: no basta con tener una evaluacion aprobada antigua."""
    import uuid as _uuid

    from app.core.database import SessionLocal
    from app.core.errors import ErrorDominio
    from app.models import Evaluacion
    from app.servicios import certificacion

    token = estudiante()
    reto_id = reto_fresco(cliente, "Recertificacion invalida")
    participacion_id = _participar(cliente, token, reto_id)
    commit = commit_que_aprueba(cliente, token, participacion_id)

    entregas = cliente.get(f"/api/v1/participaciones/{participacion_id}/entregas", headers=auth(token)).json()
    entrega = next(e for e in entregas if e["commit"] == commit)
    primera_id = entrega["evaluaciones"][0]
    identificador = esperar(cliente, token, primera_id)["credencial"]["identificador_publico"]

    cliente.post(
        f"/api/v1/credenciales/{identificador}/revocacion",
        headers=auth(representante["token"]),
        json={"motivo": "Bateria corregida."},
    )

    # Intentar emitir de nuevo sobre la evaluacion ANTERIOR a la revocacion.
    with SessionLocal() as db:
        anterior = db.get(Evaluacion, _uuid.UUID(primera_id))
        try:
            certificacion.emitir(db, anterior)
            raise AssertionError("no debio emitir sobre una evaluacion anterior a la revocacion")
        except ErrorDominio as error:
            assert error.codigo in ("EVALUACION_YA_CERTIFICADA", "EVALUACION_ANTERIOR_A_LA_REVOCACION")
