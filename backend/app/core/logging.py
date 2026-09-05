"""Logs estructurados en JSON con correlacion por peticion y por entrega.

Render y cualquier agregador de logs indexan JSON; una linea de texto plano no se puede filtrar.
Durante la evaluacion del jurado, `grep` sobre `submission_id` responde en un segundo que paso
con una entrega concreta.
"""

import json
import logging
import sys
from contextvars import ContextVar

# Los ContextVar sobreviven al salto entre la peticion y la tarea en segundo plano.
request_id: ContextVar[str | None] = ContextVar("request_id", default=None)
evaluacion_id: ContextVar[str | None] = ContextVar("evaluacion_id", default=None)

_RESERVADOS = frozenset(logging.LogRecord("", 0, "", 0, "", (), None).__dict__) | {
    "message",
    "asctime",
    "taskName",
}


class FormatoJson(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        salida = {
            "hora": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "nivel": record.levelname,
            "logger": record.name,
            "mensaje": record.getMessage(),
        }
        if (rid := request_id.get()) is not None:
            salida["request_id"] = rid
        if (eid := evaluacion_id.get()) is not None:
            salida["evaluacion_id"] = eid
        # Campos extra pasados como logger.info("...", extra={"clave": valor})
        salida.update({k: v for k, v in record.__dict__.items() if k not in _RESERVADOS})
        if record.exc_info:
            salida["excepcion"] = self.formatException(record.exc_info)
        return json.dumps(salida, ensure_ascii=False, default=str)


def configurar_logging(nivel: str = "INFO", json_activo: bool = True) -> None:
    manejador = logging.StreamHandler(sys.stdout)
    manejador.setFormatter(
        FormatoJson() if json_activo else logging.Formatter("%(asctime)s %(levelname)-7s %(name)s  %(message)s")
    )
    raiz = logging.getLogger()
    raiz.handlers = [manejador]
    raiz.setLevel(nivel)
    # uvicorn trae sus propios manejadores; se le quitan para que todo salga en el mismo formato.
    for nombre in ("uvicorn", "uvicorn.error"):
        logging.getLogger(nombre).handlers = []
        logging.getLogger(nombre).propagate = True
    # El log de acceso de uvicorn repetiria cada peticion que ya registra el middleware.
    acceso = logging.getLogger("uvicorn.access")
    acceso.handlers = []
    acceso.propagate = False
