import uuid

from pydantic import BaseModel, EmailStr, Field

from app.dominio.enums import FuncionRepresentante, VisibilidadPerfil


class DatosPerfil(BaseModel):
    nombre_publico: str | None = None
    universidad: str | None = None
    carrera: str | None = None
    ciclo: int | None = Field(default=None, ge=1, le=12)


class RegistroEntrada(BaseModel):
    correo: EmailStr
    password: str = Field(min_length=8, max_length=72)
    nombre: str = Field(min_length=2, max_length=255)
    # Un usuario puede crear su perfil de estudiante al registrarse; no es un rol excluyente.
    perfil_estudiante: DatosPerfil | None = None


class LoginEntrada(BaseModel):
    correo: EmailStr
    password: str


class RepresentacionSalida(BaseModel):
    organizacion_id: uuid.UUID
    organizacion: str
    funcion_autorizada: FuncionRepresentante


class UsuarioSalida(BaseModel):
    id: uuid.UUID
    correo: EmailStr
    nombre: str
    tiene_perfil_estudiante: bool
    representaciones: list[RepresentacionSalida] = []


class TokenSalida(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expira_en: int
    usuario: UsuarioSalida


class PerfilSalida(BaseModel):
    nombre_publico: str
    biografia: str | None = None
    visibilidad: VisibilidadPerfil
    universidad: str | None = None
    carrera: str | None = None
    ciclo: int | None = None


class PerfilActualizar(BaseModel):
    nombre_publico: str | None = Field(default=None, min_length=2, max_length=255)
    biografia: str | None = None
    visibilidad: VisibilidadPerfil | None = None
