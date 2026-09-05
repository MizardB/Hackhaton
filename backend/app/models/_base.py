import uuid
from datetime import UTC, datetime

from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column


def ahora() -> datetime:
    return datetime.now(UTC)


class IdentificadorPropio:
    """Entidades con identificador propio, segun el E-R conceptual.

    Las entidades dependientes (`Representacion`, `ResultadoPrueba`, `RevocacionCredencial`)
    no lo usan: se identifican por la combinacion de sus padres.
    """

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
