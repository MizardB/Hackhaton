from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import get_settings

settings = get_settings()
_LIMITE_BCRYPT = 72  # bcrypt ignora lo que exceda 72 bytes; truncar explicitamente evita sorpresas


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode()[:_LIMITE_BCRYPT], bcrypt.gensalt()).decode()


def verificar_password(password: str, hash_guardado: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode()[:_LIMITE_BCRYPT], hash_guardado.encode())
    except ValueError:
        return False


def crear_token(sub: str, rol: str) -> str:
    ahora = datetime.now(UTC)
    payload = {
        "sub": sub,
        "rol": rol,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def leer_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
