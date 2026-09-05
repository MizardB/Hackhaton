from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.credenciales import a_salida as credencial_a_salida
from app.core.database import get_db
from app.core.errors import ErrorDominio
from app.dominio.enums import VisibilidadPerfil
from app.models import Credencial, Participacion, PerfilEstudiante
from app.schemas.credencial import PerfilPublicoSalida

router = APIRouter()


@router.get("/perfiles/{nombre_publico}", response_model=PerfilPublicoSalida)
def perfil_publico(nombre_publico: str, db: Session = Depends(get_db)):
    """Consulta publica limitada al perfil publicado (seccion 5 del diseno).

    Un perfil privado devuelve 404 y no 403: no confirma su existencia.
    """
    perfil = db.scalar(select(PerfilEstudiante).where(PerfilEstudiante.nombre_publico == nombre_publico))
    if perfil is None or perfil.visibilidad != VisibilidadPerfil.PUBLICO:
        raise ErrorDominio("PERFIL_NO_ENCONTRADO", "No existe ese perfil publico.", http=404)

    credenciales = db.scalars(
        select(Credencial)
        .join(Participacion, Credencial.participacion_id == Participacion.id)
        .where(Participacion.perfil_usuario_id == perfil.usuario_id)
        .order_by(Credencial.momento_emision.desc())
    ).all()

    return PerfilPublicoSalida(
        nombre_publico=perfil.nombre_publico,
        biografia=perfil.biografia,
        universidad=perfil.universidad,
        carrera=perfil.carrera,
        ciclo=perfil.ciclo,
        credenciales=[credencial_a_salida(c) for c in credenciales],
    )
