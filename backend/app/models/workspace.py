"""Espacio de trabajo del editor web.

Es el borrador MUTABLE de una participacion: lo que el estudiante escribe y guarda tantas veces
como quiera. No es una entrega. Guardar aqui no crea intento, no dispara evaluacion y no puede
sustentar una credencial.

La copia congelada que si se evalua es `Entrega`, y se crea al enviar oficialmente.

Los archivos se guardan como un documento JSON canonico en `archivos`: para un borrador que se
reemplaza entero en cada guardado, una tabla por archivo no aporta nada y complica el reemplazo
atomico. El limite de tamano lo impone el esquema de entrada, no la columna.

`revision` es el control de concurrencia optimista: el cliente envia la revision sobre la que
edito y el servidor rechaza el guardado si otra pestana ya escribio. Sin esto, dos pestanas
abiertas se pisan en silencio y el estudiante pierde trabajo.
"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._base import ahora
from app.models._tipos import MomentoUTC

# Documento vacio con el que nace un espacio antes de recibir el proyecto base.
PROYECTO_VACIO = '{"version": 1, "archivos": []}'


class EspacioTrabajo(Base):
    """Identidad dependiente: se identifica por su participacion. Hay como maximo uno."""

    __tablename__ = "espacio_trabajo"

    participacion_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("participacion.id"), primary_key=True)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    archivos: Mapped[str] = mapped_column(Text, default=PROYECTO_VACIO)
    bytes_total: Mapped[int] = mapped_column(Integer, default=0)
    momento_guardado: Mapped[datetime] = mapped_column(MomentoUTC, default=ahora)

    participacion: Mapped["Participacion"] = relationship()  # noqa: F821
