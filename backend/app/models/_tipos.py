"""Tipos de columna propios.

SQLite no guarda la zona horaria: `DateTime(timezone=True)` devuelve datetimes ingenuos, y
compararlos con uno consciente lanza TypeError. En PostgreSQL el mismo codigo funciona, asi que
el fallo solo aparece en local o en CI. Este tipo normaliza en ambos sentidos: lo que entra se
convierte a UTC y lo que sale siempre lleva zona horaria.
"""

from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlalchemy.types import TypeDecorator


class MomentoUTC(TypeDecorator):
    """Dominio `Momento` del modelo conceptual, siempre en UTC y siempre consciente."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.astimezone(UTC)

    def process_result_value(self, value: datetime | None, dialect) -> datetime | None:
        if value is None:
            return None
        return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)
