import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import usuario_actual
from app.core.database import get_db
from app.core.errors import ErrorDominio
from app.dominio.enums import EstadoReto
from app.models import Reto, Usuario
from app.schemas.comunes import Pagina
from app.schemas.reto import (
    OrganizacionSalida,
    PruebaSalida,
    RetoActualizar,
    RetoDetalle,
    RetoResumen,
)
from app.servicios import retos as servicio_retos
from app.servicios import seguridad

router = APIRouter()


def _resumen(reto: Reto) -> dict:
    return {
        "id": reto.id,
        "titulo": reto.titulo,
        "estado": reto.estado,
        "organizacion": OrganizacionSalida(
            id=reto.organizacion.id,
            nombre=reto.organizacion.nombre,
            logo=reto.organizacion.logo,
            sitio_web=reto.organizacion.sitio_web,
        ),
        "momento_publicacion": reto.momento_publicacion,
        "momento_cierre": reto.momento_cierre,
        "pruebas_obligatorias": sum(1 for p in reto.pruebas if p.obligatoria),
        "pruebas_totales": len(reto.pruebas),
    }


@router.get("/retos", response_model=Pagina[RetoResumen])
def listar(
    db: Session = Depends(get_db),
    estado: EstadoReto = EstadoReto.PUBLICADO,
    organizacion_id: uuid.UUID | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
):
    """Catalogo publico. Los borradores no se listan aqui: se consultan desde el portal."""
    consulta = select(Reto).where(Reto.estado == estado)
    if estado == EstadoReto.BORRADOR:
        raise ErrorDominio(
            "ESTADO_NO_PUBLICO", "Los borradores se consultan desde el portal de la organizacion.", http=403
        )
    if organizacion_id:
        consulta = consulta.where(Reto.organizacion_id == organizacion_id)
    if q:
        consulta = consulta.where(Reto.titulo.ilike(f"%{q}%"))

    total = db.scalar(select(func.count()).select_from(consulta.subquery())) or 0
    filas = db.scalars(consulta.offset((page - 1) * size).limit(size)).all()
    return Pagina[RetoResumen](items=[RetoResumen(**_resumen(r)) for r in filas], total=total, page=page, size=size)


def reto_visible(db: Session, reto_id: uuid.UUID) -> Reto:
    reto = db.get(Reto, reto_id)
    if reto is None:
        raise ErrorDominio("RETO_NO_ENCONTRADO", "No existe ese reto.", http=404)
    return reto


@router.get("/retos/{reto_id}", response_model=RetoDetalle)
def detalle(reto_id: uuid.UUID, db: Session = Depends(get_db)):
    reto = reto_visible(db, reto_id)
    if reto.estado == EstadoReto.BORRADOR:
        raise ErrorDominio("RETO_NO_ENCONTRADO", "No existe ese reto.", http=404)
    return _detalle(reto)


def _detalle(reto: Reto) -> RetoDetalle:
    return RetoDetalle(
        **_resumen(reto),
        descripcion_publica=reto.descripcion_publica,
        criterios_aceptacion=reto.criterios_aceptacion,
        repositorio_base=reto.repositorio_base,
        version_base=reto.version_base,
        pruebas=[PruebaSalida.model_validate(p, from_attributes=True) for p in reto.pruebas],
    )


@router.get("/retos/{reto_id}/borrador", response_model=RetoDetalle)
def ver_borrador(reto_id: uuid.UUID, db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)):
    """RN-ING-02: el representante revisa el borrador antes de publicar."""
    reto = reto_visible(db, reto_id)
    seguridad.exigir_gestion_de_retos(db, actor, reto.organizacion_id, "reto.borrador_consultado", f"reto:{reto.id}")
    return _detalle(reto)


@router.patch("/retos/{reto_id}", response_model=RetoDetalle)
def corregir_borrador(
    reto_id: uuid.UUID, datos: RetoActualizar, db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)
):
    """La revision humana puede corregir el texto propuesto por la IA antes de publicar."""
    reto = reto_visible(db, reto_id)
    seguridad.exigir_gestion_de_retos(db, actor, reto.organizacion_id, "reto.corregido", f"reto:{reto.id}")
    if reto.estado != EstadoReto.BORRADOR:
        raise ErrorDominio("RETO_NO_ES_BORRADOR", "Tras publicar se fijan criterios y pruebas certificables.", http=409)
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(reto, campo, valor)
    db.commit()
    db.refresh(reto)
    return _detalle(reto)


@router.post("/retos/{reto_id}/publicacion", response_model=RetoDetalle)
def publicar(reto_id: uuid.UUID, db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)):
    return _detalle(servicio_retos.publicar(db, reto_visible(db, reto_id), actor))


@router.post("/retos/{reto_id}/cierre", response_model=RetoDetalle)
def cerrar(reto_id: uuid.UUID, db: Session = Depends(get_db), actor: Usuario = Depends(usuario_actual)):
    return _detalle(servicio_retos.cerrar(db, reto_visible(db, reto_id), actor))
