"""Bitacora minima. RN-AUD-01.

Publicacion, solicitud y fin de evaluacion, emision, revocacion y denegaciones relevantes
registran accion, momento, resultado, recurso y origen.
"""

import uuid

from sqlalchemy.orm import Session

from app.dominio.enums import OrigenEvento, ResultadoOperacion
from app.models import EventoAuditoria, Usuario


def registrar(
    db: Session,
    accion: str,
    referencia_recurso: str,
    resultado: ResultadoOperacion = ResultadoOperacion.EXITO,
    actor: Usuario | None = None,
    origen: OrigenEvento = OrigenEvento.USUARIO,
    detalle: str | None = None,
) -> EventoAuditoria:
    """El actor es obligatorio cuando el origen es USUARIO y ausente cuando es SISTEMA."""
    if origen == OrigenEvento.USUARIO and actor is None:
        raise ValueError("Un evento de origen USUARIO exige actor (RN-AUD-01).")

    evento = EventoAuditoria(
        usuario_id=actor.id if (actor and origen == OrigenEvento.USUARIO) else None,
        accion=accion,
        resultado=resultado,
        origen=origen,
        referencia_recurso=referencia_recurso,
        detalle_saneado=detalle,
    )
    db.add(evento)
    return evento


def referencia(entidad: str, identificador: uuid.UUID | str) -> str:
    return f"{entidad}:{identificador}"
