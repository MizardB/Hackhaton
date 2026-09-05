import uuid

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ErrorDominio
from app.core.security import leer_token
from app.models import Usuario


def usuario_actual(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ErrorDominio("CREDENCIALES_INVALIDAS", "Falta el token de acceso.", http=401)

    datos = leer_token(authorization.split(" ", 1)[1])
    if not datos:
        raise ErrorDominio("CREDENCIALES_INVALIDAS", "El token es invalido o expiro.", http=401)

    usuario = db.get(Usuario, uuid.UUID(datos["sub"]))
    if usuario is None:
        raise ErrorDominio("CREDENCIALES_INVALIDAS", "El usuario no esta disponible.", http=401)
    return usuario
