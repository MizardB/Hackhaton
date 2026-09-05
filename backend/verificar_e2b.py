"""Comprobacion de la integracion con E2B. Es la evidencia del bloque B2 del procedimiento.

Crea un sandbox real, escribe un proyecto de dos archivos, lo compila y ejecuta la misma
comprobacion dos veces: una que debe aprobar y otra que debe fallar. Si las dos salidas coinciden
con lo esperado, el evaluador de sandbox puede distinguir una solucion correcta de una incorrecta,
que es justo lo que el evaluador simulado no hace.

Uso:  python verificar_e2b.py

Lee E2B_API_KEY del .env, igual que la aplicacion, asi que tambien comprueba que la variable
esta donde el backend la va a buscar. No imprime la clave.
"""

import sys
import time

from app.core.config import get_settings

RAIZ = "/home/user/proyecto"
MAIN = "def suma(a, b):\n    return a + b\n"
PRUEBA_QUE_APRUEBA = "from main import suma\n\n\ndef test_suma():\n    assert suma(2, 3) == 5\n"
PRUEBA_QUE_FALLA = "from main import suma\n\n\ndef test_suma():\n    assert suma(2, 3) == 6\n"


def correr(sandbox, comando: str, timeout: float = 60):
    """`commands.run` levanta una excepcion cuando el codigo de salida no es cero.

    Esa excepcion trae los mismos campos que un resultado, asi que se devuelve tal cual: aqui
    una salida distinta de cero es justo lo que se quiere observar.
    """
    from e2b.sandbox.commands.command_handle import CommandExitException

    try:
        return sandbox.commands.run(comando, cwd=RAIZ, timeout=timeout)
    except CommandExitException as salida:
        return salida


def main() -> int:
    clave = get_settings().E2B_API_KEY
    if not clave:
        print("FALTA E2B_API_KEY en el .env. Sin ella el evaluador de sandbox no puede arrancar.")
        return 1
    print(f"[0] E2B_API_KEY presente ({len(clave)} caracteres, termina en ...{clave[-4:]})")

    try:
        from e2b_code_interpreter import Sandbox
    except ImportError:
        print("FALTA el SDK. Instalar con:  pip install e2b-code-interpreter==2.9.2")
        return 1

    inicio = time.perf_counter()
    sandbox = Sandbox.create(api_key=clave, timeout=120)
    print(f"[1] sandbox creado en {time.perf_counter() - inicio:.1f} s  id={sandbox.sandbox_id}")

    try:
        sandbox.files.make_dir(RAIZ)
        sandbox.files.write(f"{RAIZ}/main.py", MAIN)
        sandbox.files.make_dir(f"{RAIZ}/tests")
        sandbox.files.write(f"{RAIZ}/tests/test_contrato.py", PRUEBA_QUE_APRUEBA)
        print(f"[2] archivos escritos: {sorted(e.name for e in sandbox.files.list(RAIZ))}")

        compilacion = correr(sandbox, "python -m compileall -q .", 30)
        print(f"[3] compileall  exit={compilacion.exit_code}  (0 = el proyecto compila)")

        versiones = correr(sandbox, "python --version && python -m pytest --version", 30)
        print(f"[4] entorno del sandbox: {' | '.join((versiones.stdout or '').split())}")

        marca = time.perf_counter()
        buena = correr(sandbox, "python -m pytest tests/test_contrato.py -q")
        print(f"[5] solucion correcta   exit={buena.exit_code}  en {int((time.perf_counter() - marca) * 1000)} ms")

        sandbox.files.write(f"{RAIZ}/tests/test_contrato.py", PRUEBA_QUE_FALLA)
        mala = correr(sandbox, "python -m pytest tests/test_contrato.py -q")
        print(f"[6] solucion incorrecta exit={mala.exit_code}  (distinto de 0 = la bateria la detecta)")
    finally:
        sandbox.kill()
        print(f"[7] sandbox cerrado. Tiempo total facturado aproximado: {time.perf_counter() - inicio:.1f} s")

    if buena.exit_code == 0 and mala.exit_code != 0:
        print("\nRESULTADO: la ejecucion en sandbox distingue una solucion correcta de una incorrecta.")
        return 0
    print("\nRESULTADO: las salidas no son las esperadas. Revisar antes de poner EVALUADOR=e2b.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
