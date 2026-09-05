import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._base import IdentificadorPropio, ahora
from app.models._tipos import MomentoUTC


class Credencial(IdentificadorPropio, Base):
    """RN-CRED-07: una evaluacion sustenta como maximo una credencial en este MVP individual.

    La vigencia NO se persiste: se deriva de la ausencia de revocacion (RN-CRED-04).
    """

    __tablename__ = "credencial"

    participacion_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("participacion.id"))
    evaluacion_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("evaluacion.id"), unique=True)
    identificador_publico: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    momento_emision: Mapped[datetime] = mapped_column(MomentoUTC, default=ahora)
    # Presentacion historica de lo emitido; no se recalcula al cambiar el perfil o el reto.
    contenido_emitido: Mapped[str] = mapped_column(Text)
    huella_contenido: Mapped[str] = mapped_column(String(64))

    participacion: Mapped["Participacion"] = relationship(back_populates="credenciales")  # noqa: F821
    evaluacion: Mapped["Evaluacion"] = relationship(lazy="joined")  # noqa: F821
    revocacion: Mapped["RevocacionCredencial | None"] = relationship(
        back_populates="credencial", uselist=False, lazy="joined"
    )

    def esta_vigente(self) -> bool:
        return self.revocacion is None


class RevocacionCredencial(Base):
    """RN-REV-01: cada credencial admite como maximo una revocacion. Identidad dependiente."""

    __tablename__ = "revocacion_credencial"

    credencial_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("credencial.id"), primary_key=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("usuario.id"))
    momento_revocacion: Mapped[datetime] = mapped_column(MomentoUTC, default=ahora)
    motivo: Mapped[str] = mapped_column(Text)

    credencial: Mapped[Credencial] = relationship(back_populates="revocacion")
