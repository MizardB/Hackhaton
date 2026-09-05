import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import usuario_actual
from app.core.database import get_db
from app.core.errors import ErrorDominio
from app.models import Participacion, Reto, Usuario
from app.schemas.evaluacion import ParticipacionSalida
from app.servicios import auditoria, certificacion, seguridad

router = APIRouter()


def a_salida(db: Session, participacion: Participacion) -> ParticipacionSalida:
    reto = participacion.reto
    vigente = certificacion.credencial_vigente(db, participacion.id) is not None
    return ParticipacionSalida(
        id=participacion.id,
        reto_id=reto.id,
        titulo_reto=reto.titulo,
        momento_incorporacion=participacion.momento_incorporacion,
        repositorio_base=reto.repositorio_base,
        version_base=reto.version_base,
        condicion_certificacion=certificacion.condicion_participacion(db, participacion.id),
        admite_entrega=reto.admite_entregas() and not vigente,
    )


@router.post(
    "/retos/{reto_id}/participaciones", response_model=ParticipacionSalida, status_code=status.HTTP_201_CREATED
)
def participar(reto_id: uuid.UUID, db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)):
    """RN-PART-01: un perfil tiene como maximo una participacion por reto."""
    perfil = seguridad.perfil_propio(db, actor)

    reto = db.get(Reto, reto_id)
    if reto is None:
        raise ErrorDominio("RETO_NO_ENCONTRADO", "No existe ese reto.", http=404)
    if not reto.admite_entregas():
        raise ErrorDominio(
            "RETO_NO_DISPONIBLE",
            "El reto no admite nuevas participaciones.",
            http=409,
            detalles={"estado": reto.estado},
        )

    if db.scalar(
        select(Participacion).where(
            Participacion.perfil_usuario_id == perfil.usuario_id, Participacion.reto_id == reto.id
        )
    ):
        raise ErrorDominio("PARTICIPACION_YA_EXISTE", "Ya existe una participacion en ese reto.", http=409)

    participacion = Participacion(perfil_usuario_id=perfil.usuario_id, reto_id=reto.id)
    db.add(participacion)
    db.flush()
    auditoria.registrar(
        db, "participacion.creada", auditoria.referencia("participacion", participacion.id), actor=actor
    )
    db.commit()
    db.refresh(participacion)
    return a_salida(db, participacion)


@router.get("/participaciones/mias", response_model=list[ParticipacionSalida])
def mias(db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)):
    perfil = seguridad.perfil_propio(db, actor)
    filas = db.scalars(
        select(Participacion)
        .where(Participacion.perfil_usuario_id == perfil.usuario_id)
        .order_by(Participacion.momento_incorporacion.desc())
    ).all()
    return [a_salida(db, p) for p in filas]


@router.get("/participaciones/{participacion_id}", response_model=ParticipacionSalida)
def detalle(participacion_id: uuid.UUID, db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)):
    return a_salida(db, seguridad.participacion_propia(db, actor, participacion_id))
