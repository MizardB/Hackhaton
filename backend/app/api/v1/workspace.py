"""Rutas del espacio de trabajo del editor web.

Dos operaciones: abrir el borrador y guardarlo. Ninguna crea entrega ni dispara evaluacion.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import usuario_actual
from app.core.database import get_db
from app.models import EspacioTrabajo, Usuario
from app.schemas.workspace import ArchivoSalida, EspacioSalida, GuardarBorrador
from app.servicios import certificacion, seguridad
from app.servicios import workspace as servicio_workspace

router = APIRouter()


def _a_salida(db: Session, participacion, espacio: EspacioTrabajo) -> EspacioSalida:
    reto = participacion.reto
    archivos = servicio_workspace.leer_archivos(espacio.archivos)

    # El editor no tiene que deducir por su cuenta si el boton de enviar debe estar activo.
    motivo = None
    if not reto.admite_entregas():
        motivo = "El reto no admite entregas."
    elif certificacion.credencial_vigente(db, participacion.id) is not None:
        motivo = "La participacion ya conserva una credencial vigente."

    return EspacioSalida(
        participacion_id=str(participacion.id),
        reto_id=str(reto.id),
        titulo_reto=reto.titulo,
        revision=espacio.revision,
        archivos=[
            ArchivoSalida(
                ruta=a["ruta"],
                contenido=a["contenido"],
                bytes=len(a["contenido"].encode("utf-8")),
            )
            for a in archivos
        ],
        bytes_total=espacio.bytes_total,
        momento_guardado=espacio.momento_guardado.isoformat() if espacio.momento_guardado else None,
        puede_enviar=motivo is None,
        motivo_bloqueo=motivo,
    )


@router.get("/participaciones/{participacion_id}/workspace", response_model=EspacioSalida)
def abrir(
    participacion_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor: Usuario = Depends(usuario_actual),
):
    """Abre el borrador. Volver a abrirlo no borra los cambios guardados."""
    participacion = seguridad.participacion_propia(db, actor, participacion_id)
    espacio = servicio_workspace.obtener_o_crear(db, participacion)
    db.commit()
    db.refresh(espacio)
    return _a_salida(db, participacion, espacio)


@router.put("/participaciones/{participacion_id}/workspace", response_model=EspacioSalida)
def guardar(
    participacion_id: uuid.UUID,
    datos: GuardarBorrador,
    db: Session = Depends(get_db),
    actor: Usuario = Depends(usuario_actual),
):
    """Guarda el borrador. No crea entrega ni incrementa el numero de intento.

    Si otra pestana guardo antes, responde 409 BORRADOR_DESACTUALIZADO sin sobrescribir.
    """
    participacion = seguridad.participacion_propia(db, actor, participacion_id)
    espacio = servicio_workspace.obtener_o_crear(db, participacion)
    servicio_workspace.guardar(
        db,
        espacio,
        datos.revision_base,
        [{"ruta": a.ruta, "contenido": a.contenido} for a in datos.archivos],
    )
    db.commit()
    db.refresh(espacio)
    return _a_salida(db, participacion, espacio)
