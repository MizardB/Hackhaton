"""Evaluador simulado del MVP.

No ejecuta el commit: deriva cada resultado de sha256(commit + id de la prueba), de forma
determinista, de modo que la misma entrega arroja siempre lo mismo y cualquiera puede
reproducirlo. La version viaja en `Evaluacion.version_evaluador` y la API la expone, para que
nada afirme una ejecucion que no ocurrio.

Sustituirlo por un evaluador real es implementar `EvaluadorAislado` y cambiar una variable de
entorno; ningun servicio cambia.
"""

import hashlib

from app.dominio.enums import CategoriaPrueba, CondicionEjecucion
from app.servicios.puertos import FalloEvaluador, ResultadoEjecutado, SalidaEvaluador

VERSION = "simulado:v1"
_COMMIT_QUE_FALLA = "fallo-de-entorno"  # reservado para demostrar RN-EVAL-03


def _byte(*partes: str) -> int:
    return hashlib.sha256("|".join(partes).encode()).digest()[0]


class EvaluadorSimulado:
    def ejecutar(self, repositorio: str, commit: str, pruebas: list, archivos: list | None = None) -> SalidaEvaluador:
        # `archivos` se ignora a proposito: este evaluador no ejecuta nada, y usarlo daria a
        # entender que el contenido influyo en el resultado. Solo lo usa EvaluadorE2B.
        if commit == _COMMIT_QUE_FALLA:
            raise FalloEvaluador("El entorno de ejecucion no pudo preparar el repositorio.")

        resultados: list[ResultadoEjecutado] = []
        for prueba in pruebas:
            semilla = _byte(commit, str(prueba.id))
            # Las obligatorias describen el contrato basico y fallan mucho menos que las de
            # rendimiento, que dependen de la carga.
            umbral = 3 if prueba.obligatoria else 26
            aprobada = semilla > umbral
            duracion = 8 + _byte(commit, str(prueba.id), "d") % 120

            valor = unidad = None
            if prueba.categoria == CategoriaPrueba.RENDIMIENTO:
                valor = round(28 + _byte(commit, str(prueba.id), "v") % 30 + 0.4, 1)
                unidad = "ms"

            resultados.append(
                ResultadoEjecutado(
                    prueba_id=prueba.id,
                    condicion_ejecucion=CondicionEjecucion.EJECUTADA,
                    aprobada=aprobada,
                    valor_observado=valor,
                    unidad=unidad,
                    duracion_ms=duracion,
                    detalle=None if aprobada else "La comprobacion no se cumplio.",
                )
            )
        return SalidaEvaluador(version_evaluador=VERSION, resultados=resultados)
