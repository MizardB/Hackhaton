"""ServicioSeguridad del UML.

Valida propiedad del perfil o de la participacion, o el permiso de la representacion sobre el
recurso. Ser dueno del perfil no concede permiso para emitir o revocar credenciales.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ErrorDominio
from app.dominio.enums import FuncionRepresentante, ResultadoOperacion
from app.models import Participacion, PerfilEstudiante, Representacion, Usuario
from app.models._base import ahora
from app.servicios import auditoria


def _denegar(
    db: Session, actor: Usuario, accion: str, recurso: str, mensaje: str, codigo: str, http: int = 403
) -> None:
    auditoria.registrar(db, accion, recurso, ResultadoOperacion.DENEGADA, actor=actor)
    db.commit()
    raise ErrorDominio(codigo, mensaje, http=http)


def perfil_propio(db: Session, actor: Usuario) -> PerfilEstudiante:
    perfil = db.get(PerfilEstudiante, actor.id)
    if perfil is None:
        raise ErrorDominio(
            "SIN_PERFIL_ESTUDIANTE",
            "La operacion requiere un perfil de estudiante en la cuenta.",
            http=403,
        )
    return perfil


def participacion_propia(db: Session, actor: Usuario, participacion_id: uuid.UUID) -> Participacion:
    """Devuelve 404 y no 403 cuando la participacion es de otra persona: no se confirma
    su existencia a quien no es su dueno."""
    participacion = db.get(Participacion, participacion_id)
    if participacion is None or participacion.perfil_usuario_id != actor.id:
        raise ErrorDominio("PARTICIPACION_NO_ENCONTRADA", "No existe esa participacion.", http=404)
    return participacion


def representacion_activa(db: Session, actor: Usuario, organizacion_id: uuid.UUID) -> Representacion | None:
    representacion = db.get(Representacion, (actor.id, organizacion_id))
    if representacion is None or not representacion.esta_activa(ahora()):
        return None
    return representacion


def exigir_gestion_de_retos(
    db: Session, actor: Usuario, organizacion_id: uuid.UUID, accion: str, recurso: str
) -> Representacion:
    """RN-ORG-01: actuar por la organizacion exige representacion habilitada y operacion
    autorizada."""
    representacion = representacion_activa(db, actor, organizacion_id)
    if representacion is None or not FuncionRepresentante(representacion.funcion_autorizada).puede_gestionar_retos():
        _denegar(
            db,
            actor,
            accion,
            recurso,
            "La cuenta no representa a esa organizacion con permiso de gestion de retos.",
            "REPRESENTACION_INSUFICIENTE",
        )
    return representacion


def exigir_revocacion(
    db: Session, actor: Usuario, organizacion_id: uuid.UUID, accion: str, recurso: str
) -> Representacion:
    representacion = representacion_activa(db, actor, organizacion_id)
    if representacion is None or not FuncionRepresentante(representacion.funcion_autorizada).puede_revocar():
        _denegar(
            db,
            actor,
            accion,
            recurso,
            "La cuenta no representa a esa organizacion con permiso de revocacion.",
            "REPRESENTACION_INSUFICIENTE",
        )
    return representacion


def organizaciones_representadas(db: Session, actor: Usuario) -> list[Representacion]:
    filas = db.scalars(select(Representacion).where(Representacion.usuario_id == actor.id)).all()
    return [r for r in filas if r.esta_activa(ahora())]
