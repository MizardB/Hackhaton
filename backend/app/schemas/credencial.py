from datetime import datetime

from pydantic import BaseModel, Field


class RevocacionSalida(BaseModel):
    momento_revocacion: datetime
    motivo: str


class CredencialSalida(BaseModel):
    identificador_publico: str
    vigente: bool
    momento_emision: datetime
    emisor: str
    emisor_logo: str | None = None
    estudiante: str
    reto: str
    criterios_aceptacion: str
    commit: str
    repositorio: str
    version_evaluador: str
    huella_contenido: str
    revocacion: RevocacionSalida | None = None


class RevocacionEntrada(BaseModel):
    motivo: str = Field(min_length=4, max_length=500)


class PerfilPublicoSalida(BaseModel):
    nombre_publico: str
    biografia: str | None = None
    universidad: str | None = None
    carrera: str | None = None
    ciclo: int | None = None
    credenciales: list[CredencialSalida] = []
