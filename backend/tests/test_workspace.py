"""Espacio de trabajo del editor web y su conexion con la evaluacion.

| Prueba                    | Resultado que comprueba                                          |
| Abrir                     | El espacio nace vacio y volver a abrirlo no borra lo guardado    |
| Guardar                   | Incrementa la revision y devuelve el proyecto, sin crear entrega |
| Conflicto                 | Dos pestanas sobre la misma revision: la segunda recibe 409      |
| Limites                   | Una ruta con `..` o una extension no admitida se rechaza con 422 |
| Fuente de la evaluacion   | El evaluador recibe los archivos guardados, no una cadena vacia  |
"""

from tests.conftest import auth, reto_fresco

PROYECTO = [{"ruta": "main.py", "contenido": "def suma(a, b):\n    return a + b\n"}]


def _participar(cliente, token, titulo: str) -> str:
    reto_id = reto_fresco(cliente, titulo)
    r = cliente.post(f"/api/v1/retos/{reto_id}/participaciones", headers=auth(token))
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_abrir_crea_un_espacio_vacio_y_no_borra_lo_guardado(cliente, estudiante, datos_demo):
    token = estudiante()
    participacion_id = _participar(cliente, token, "Abrir espacio")

    r = cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token))
    assert r.status_code == 200, r.text
    espacio = r.json()
    assert espacio["revision"] == 0
    assert espacio["archivos"] == []
    assert espacio["puede_enviar"] is True

    cliente.put(
        f"/api/v1/participaciones/{participacion_id}/workspace",
        headers=auth(token),
        json={"revision_base": 0, "archivos": PROYECTO},
    )

    # Volver a abrir devuelve lo guardado; abrir no reinicia el borrador.
    de_nuevo = cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token)).json()
    assert de_nuevo["revision"] == 1
    assert [a["ruta"] for a in de_nuevo["archivos"]] == ["main.py"]


def test_guardar_incrementa_la_revision_y_no_crea_entrega(cliente, estudiante, datos_demo):
    token = estudiante()
    participacion_id = _participar(cliente, token, "Guardar borrador")
    cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token))

    for revision_esperada in (1, 2, 3):
        r = cliente.put(
            f"/api/v1/participaciones/{participacion_id}/workspace",
            headers=auth(token),
            json={"revision_base": revision_esperada - 1, "archivos": PROYECTO},
        )
        assert r.status_code == 200, r.text
        assert r.json()["revision"] == revision_esperada

    # Regla 3 del procedimiento: guardar no es enviar.
    entregas = cliente.get(f"/api/v1/participaciones/{participacion_id}/entregas", headers=auth(token)).json()
    assert entregas == []


def test_dos_pestanas_sobre_la_misma_revision_no_se_sobrescriben(cliente, estudiante, datos_demo):
    token = estudiante()
    participacion_id = _participar(cliente, token, "Conflicto de revision")
    cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token))

    primera = cliente.put(
        f"/api/v1/participaciones/{participacion_id}/workspace",
        headers=auth(token),
        json={"revision_base": 0, "archivos": [{"ruta": "main.py", "contenido": "# pestana uno\n"}]},
    )
    assert primera.status_code == 200

    segunda = cliente.put(
        f"/api/v1/participaciones/{participacion_id}/workspace",
        headers=auth(token),
        json={"revision_base": 0, "archivos": [{"ruta": "main.py", "contenido": "# pestana dos\n"}]},
    )
    assert segunda.status_code == 409
    assert segunda.json()["error"]["codigo"] == "BORRADOR_DESACTUALIZADO"

    # El trabajo de la primera pestana sigue intacto.
    espacio = cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token)).json()
    assert espacio["archivos"][0]["contenido"] == "# pestana uno\n"


def test_las_rutas_peligrosas_y_las_extensiones_ajenas_se_rechazan(cliente, estudiante, datos_demo):
    token = estudiante()
    participacion_id = _participar(cliente, token, "Limites del proyecto")
    cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token))

    for ruta in ("../fuera.py", "binario.exe"):
        r = cliente.put(
            f"/api/v1/participaciones/{participacion_id}/workspace",
            headers=auth(token),
            json={"revision_base": 0, "archivos": [{"ruta": ruta, "contenido": "x = 1\n"}]},
        )
        assert r.status_code == 422, f"{ruta} deberia rechazarse"

    espacio = cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token)).json()
    assert espacio["revision"] == 0


def test_la_evaluacion_recibe_los_archivos_del_espacio_de_trabajo(cliente, estudiante, datos_demo, monkeypatch):
    """El editor y la evaluacion estan conectados: lo que se guarda es lo que se ejecuta.

    Se sustituye el evaluador por un doble que anota los archivos recibidos. Sin esta prueba,
    una regresion que dejara de pasar el proyecto no rompería ninguna otra: el evaluador
    simulado no mira el contenido.
    """
    from app.servicios import evaluacion as servicio_evaluacion
    from app.servicios.evaluador_simulado import EvaluadorSimulado

    recibido: dict = {}

    class EvaluadorEspia(EvaluadorSimulado):
        def ejecutar(self, repositorio, commit, pruebas, archivos=None):
            recibido["archivos"] = archivos
            return super().ejecutar(repositorio, commit, pruebas, archivos)

    monkeypatch.setattr(servicio_evaluacion, "obtener_evaluador", lambda: EvaluadorEspia())

    token = estudiante()
    participacion_id = _participar(cliente, token, "Fuente de la evaluacion")
    cliente.get(f"/api/v1/participaciones/{participacion_id}/workspace", headers=auth(token))
    cliente.put(
        f"/api/v1/participaciones/{participacion_id}/workspace",
        headers=auth(token),
        json={"revision_base": 0, "archivos": PROYECTO},
    )

    r = cliente.post(
        f"/api/v1/participaciones/{participacion_id}/entregas",
        headers=auth(token),
        json={"repositorio": "https://github.com/demo/reto", "commit": "abc123def456"},
    )
    assert r.status_code == 202, r.text

    assert recibido["archivos"] == [{"ruta": "main.py", "contenido": PROYECTO[0]["contenido"]}]
