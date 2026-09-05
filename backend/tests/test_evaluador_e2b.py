"""Evaluador de sandbox: comportamiento sin llamar al proveedor.

El sandbox se sustituye por un doble. Lo que se comprueba no es que E2B funcione —eso lo
demuestra `verificar_e2b.py` contra el servicio real— sino que este evaluador traduce
correctamente lo que el sandbox devuelve y de donde saca la comprobacion que ejecuta.

| Prueba                     | Resultado que comprueba                                        |
| Desaprobar no es averiarse | Una prueba que falla da NO aprobada, no ERROR_TECNICO          |
| Aprobar                    | Codigo de salida cero da aprobada y duracion medida            |
| Origen de la comprobacion  | Se ejecuta el codigo del reto, nunca un archivo del estudiante |
| Reto sin comprobacion      | Sin codigo oficial no hay veredicto: NO_EJECUTADA              |
| Proyecto que no compila    | Ninguna prueba aprueba y el motivo se explica                  |
| Espacio vacio              | Sin archivos no se inventa veredicto                           |
| Sin clave                  | Falta de configuracion es fallo del entorno, no del estudiante |
"""

import uuid
from types import SimpleNamespace

import pytest
from e2b.sandbox.commands.command_handle import CommandExitException

from app.dominio.enums import CategoriaPrueba, CondicionEjecucion
from app.servicios import evaluador_e2b as modulo
from app.servicios.evaluador_e2b import OFICIAL, RAIZ, EvaluadorE2B
from app.servicios.puertos import FalloEvaluador

OFICIAL_PY = (
    'import os, sys\nsys.path.insert(0, os.environ["PROYECTO_DIR"])\n\n\ndef test_contrato():\n    assert True\n'
)

ARCHIVOS = [
    {"ruta": "main.py", "contenido": "def suma(a, b):\n    return a + b\n"},
    # El estudiante incluye un archivo con el nombre que el reto declara. No debe ejecutarse.
    {"ruta": "tests/test_contrato.py", "contenido": "def test_todo_bien():\n    assert True\n"},
]


def _prueba(contenido: str | None = OFICIAL_PY, categoria=CategoriaPrueba.FUNCIONAL):
    return SimpleNamespace(
        id=uuid.uuid4(),
        referencia_ejecutable="tests/test_contrato.py",
        contenido_ejecutable=contenido,
        categoria=categoria,
        obligatoria=True,
        limite_ejecucion_ms=None,
    )


class _Comandos:
    def __init__(self, salida_pytest, registro: list):
        self._salida_pytest = salida_pytest
        self.registro = registro

    def run(self, comando, cwd=None, timeout=None, envs=None):
        self.registro.append({"comando": comando, "cwd": cwd, "envs": envs})
        if "compileall" in comando:
            return SimpleNamespace(exit_code=0, stdout="", stderr="", error=None)
        if isinstance(self._salida_pytest, Exception):
            raise self._salida_pytest
        return self._salida_pytest


class _Archivos:
    def __init__(self, registro: list):
        self.registro = registro

    def make_dir(self, ruta):
        return True

    def write(self, ruta, datos):
        self.registro.append({"ruta": ruta, "contenido": datos})
        return SimpleNamespace(path=ruta)


class _Sandbox:
    def __init__(self, salida_pytest, compilacion_falla: bool = False):
        self.comandos: list = []
        self.escrituras: list = []
        self.files = _Archivos(self.escrituras)
        self.commands = _Comandos(salida_pytest, self.comandos)
        self.cerrado = False
        if compilacion_falla:
            self.commands.run = self._compilacion_falla

    def _compilacion_falla(self, comando, cwd=None, timeout=None, envs=None):
        raise CommandExitException(
            stderr="  File \"main.py\", line 3\n    SyntaxError: '(' was never closed",
            stdout="",
            exit_code=1,
            error=None,
        )

    def kill(self):
        self.cerrado = True
        return True


@pytest.fixture
def con_sandbox(monkeypatch):
    """Deja preparado el evaluador con clave y con el sandbox sustituido."""

    def preparar(sandbox):
        monkeypatch.setattr(modulo, "get_settings", lambda: SimpleNamespace(E2B_API_KEY="clave-de-prueba"))
        monkeypatch.setattr("e2b_code_interpreter.Sandbox", SimpleNamespace(create=lambda **_: sandbox))
        return sandbox

    return preparar


def test_una_prueba_que_falla_desaprueba_y_no_es_error_tecnico(con_sandbox):
    """El SDK levanta una excepcion cuando el codigo de salida no es cero.

    Si no se captura, un estudiante que no aprueba produce ERROR_TECNICO: la plataforma se
    declararia averiada cada vez que alguien entrega una solucion incorrecta.
    """
    fallo = CommandExitException(stderr="", stdout="1 failed in 0.12s", exit_code=1, error=None)
    sandbox = con_sandbox(_Sandbox(fallo))

    salida = EvaluadorE2B().ejecutar("repo", "commit", [_prueba()], ARCHIVOS)

    assert salida.version_evaluador == "e2b:v1"
    resultado = salida.resultados[0]
    assert resultado.condicion_ejecucion == CondicionEjecucion.EJECUTADA
    assert resultado.aprobada is False
    assert "1 failed" in resultado.detalle
    assert sandbox.cerrado is True


def test_una_prueba_que_pasa_aprueba_con_duracion_medida(con_sandbox):
    exito = SimpleNamespace(exit_code=0, stdout="1 passed in 0.10s", stderr="", error=None)
    con_sandbox(_Sandbox(exito))

    salida = EvaluadorE2B().ejecutar("repo", "commit", [_prueba()], ARCHIVOS)

    resultado = salida.resultados[0]
    assert resultado.aprobada is True
    assert resultado.detalle is None
    assert resultado.duracion_ms is not None and resultado.duracion_ms >= 0


def test_se_ejecuta_la_comprobacion_del_reto_y_no_la_del_estudiante(con_sandbox):
    """El agujero que esto cierra: si la prueba saliera del proyecto entregado, bastaria con
    incluir un `assert True` para aprobar cualquier reto."""
    exito = SimpleNamespace(exit_code=0, stdout="", stderr="", error=None)
    sandbox = con_sandbox(_Sandbox(exito))
    prueba = _prueba()

    EvaluadorE2B().ejecutar("repo", "commit", [prueba], ARCHIVOS)

    # El codigo oficial se escribe fuera del proyecto, con un nombre que fija el servidor.
    esperado = f"{OFICIAL}/prueba_{prueba.id.hex}.py"
    escrito = next(e for e in sandbox.escrituras if e["ruta"] == esperado)
    assert escrito["contenido"] == OFICIAL_PY

    # Y se ejecuta desde ahi, no desde el proyecto, sin cargar conftest del alumno.
    ejecucion = next(c for c in sandbox.comandos if "pytest" in c["comando"])
    assert ejecucion["cwd"] == OFICIAL
    assert f"prueba_{prueba.id.hex}.py" in ejecucion["comando"]
    assert "--noconftest" in ejecucion["comando"]
    assert ejecucion["envs"] == {"PROYECTO_DIR": RAIZ}
    # El archivo homonimo que trajo el estudiante nunca aparece en el comando.
    assert "tests/test_contrato.py" not in ejecucion["comando"]


def test_un_reto_sin_codigo_de_comprobacion_no_produce_veredicto(con_sandbox):
    exito = SimpleNamespace(exit_code=0, stdout="", stderr="", error=None)
    con_sandbox(_Sandbox(exito))

    salida = EvaluadorE2B().ejecutar("repo", "commit", [_prueba(contenido=None)], ARCHIVOS)

    resultado = salida.resultados[0]
    assert resultado.condicion_ejecucion == CondicionEjecucion.NO_EJECUTADA
    assert resultado.aprobada is None


def test_un_proyecto_que_no_compila_no_aprueba_ninguna_prueba(con_sandbox):
    con_sandbox(_Sandbox(None, compilacion_falla=True))

    salida = EvaluadorE2B().ejecutar("repo", "commit", [_prueba(), _prueba()], ARCHIVOS)

    assert len(salida.resultados) == 2
    for resultado in salida.resultados:
        # La causa es del codigo entregado, no del entorno: queda ejecutada y desaprobada.
        assert resultado.condicion_ejecucion == CondicionEjecucion.EJECUTADA
        assert resultado.aprobada is False
        assert "no compila" in resultado.detalle


def test_un_espacio_vacio_no_produce_veredicto(con_sandbox):
    con_sandbox(_Sandbox(None))

    salida = EvaluadorE2B().ejecutar("repo", "commit", [_prueba()], [])

    resultado = salida.resultados[0]
    assert resultado.condicion_ejecucion == CondicionEjecucion.NO_EJECUTADA
    assert resultado.aprobada is None


def test_sin_clave_configurada_el_fallo_es_del_entorno(monkeypatch):
    monkeypatch.setattr(modulo, "get_settings", lambda: SimpleNamespace(E2B_API_KEY=""))

    with pytest.raises(FalloEvaluador):
        EvaluadorE2B().ejecutar("repo", "commit", [_prueba()], ARCHIVOS)
