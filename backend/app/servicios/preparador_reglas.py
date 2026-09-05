"""Preparador sin red, por reglas.

Sanea el material privado y propone un borrador con criterios y pruebas. Es el respaldo cuando
el proveedor de LLM no responde, y el doble que usan las pruebas automaticas.

Limite deliberado (seccion 7 del diseno): no se presenta como garantia de eliminacion perfecta
de secretos. Por eso RN-ING-02 exige revision humana antes de publicar.
"""

import re

from app.dominio.enums import CategoriaPrueba
from app.servicios.puertos import BorradorReto, PruebaPropuesta

MODELO = "reglas:v1"
VERSION_INSTRUCCIONES = "2026.09.1"

PATRONES = [
    ("credencial", re.compile(r"(?i)(password|secret|api[_-]?key|token)\s*[:=]\s*\S+")),
    ("ip_interna", re.compile(r"\b(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)\d{1,3}\.\d{1,3}\b")),
    ("correo", re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")),
    ("cadena_bd", re.compile(r"(?i)\b(postgres|mysql|mongodb)://\S+")),
]


def sanear(texto: str) -> tuple[str, dict[str, int]]:
    """Devuelve el texto saneado y el recuento por tipo. El valor original nunca se conserva."""
    conteo: dict[str, int] = {}
    limpio = texto
    for tipo, patron in PATRONES:
        limpio, n = patron.subn("[REDACTADO]", limpio)
        if n:
            conteo[tipo] = n
    return limpio, conteo


class PreparadorPorReglas:
    def proponer(self, titulo_original: str, contenido: str) -> BorradorReto:
        limpio, conteo = sanear(contenido)
        detectado = ", ".join(f"{n} {t}" for t, n in conteo.items()) or "ningun elemento sensible"

        return BorradorReto(
            titulo=titulo_original,
            descripcion_publica=limpio[:2000],
            criterios_aceptacion=(
                "La solucion supera todas las pruebas obligatorias del reto y respeta las "
                "condiciones de rendimiento declaradas."
            ),
            repositorio_base=None,
            version_base=None,
            pruebas=[
                PruebaPropuesta(
                    "Contrato de la respuesta",
                    CategoriaPrueba.FUNCIONAL,
                    True,
                    "La respuesta cumple el esquema acordado.",
                    "tests/test_contrato.py",
                ),
                PruebaPropuesta(
                    "Entrada invalida",
                    CategoriaPrueba.CASO_LIMITE,
                    True,
                    "La entrada invalida se rechaza sin efectos.",
                    "tests/test_borde.py",
                ),
                PruebaPropuesta(
                    "Reintento duplicado",
                    CategoriaPrueba.CASO_LIMITE,
                    True,
                    "Un reintento no duplica el efecto.",
                    "tests/test_idempotencia.py",
                ),
                PruebaPropuesta(
                    "Latencia bajo carga",
                    CategoriaPrueba.RENDIMIENTO,
                    False,
                    "Percentil 95 por debajo de 50 ms.",
                    "tests/test_carga.py",
                    5000,
                ),
            ],
            modelo=MODELO,
            version_instrucciones=VERSION_INSTRUCCIONES,
            resumen_preparacion=(
                f"Material saneado antes de proponer el borrador: {detectado}. "
                "El texto publico no conserva los valores detectados. Requiere revision humana "
                "antes de publicar."
            ),
        )
