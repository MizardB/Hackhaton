from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Pagina(BaseModel, Generic[T]):
    """Forma unica de toda respuesta de lista."""

    items: list[T]
    total: int
    page: int
    size: int
