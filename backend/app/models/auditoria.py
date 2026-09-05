import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.dominio.enums import OrigenEvento, ResultadoOperacion
from app.models._base import IdentificadorPropio, ahora
from app.models._tipos import MomentoUTC


class EventoAuditoria(IdentificadorPropio, Base):
    """RN-AUD-01. `referencia_recurso` es una referencia para control, no una relacion
    universal a todas las entidades."""

    __tablename__ = "evento_auditoria"

    # Obligatorio cuando el origen es USUARIO; ausente cuando lo es SISTEMA.
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("usuario.id"), nullable=True)
    momento: Mapped[datetime] = mapped_column(MomentoUTC, default=ahora, index=True)
    accion: Mapped[str] = mapped_column(String(60), index=True)
    resultado: Mapped[str] = mapped_column(String(16), default=ResultadoOperacion.EXITO)
    origen: Mapped[str] = mapped_column(String(16), default=OrigenEvento.USUARIO)
    referencia_recurso: Mapped[str] = mapped_column(String(120))
    detalle_saneado: Mapped[str | None] = mapped_column(Text, nullable=True)
