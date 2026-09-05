"""Contratos del espacio de trabajo del editor web.

Los limites viven aqui y no en el modelo: son politica de entrada, y cambiarlos no debe obligar a
una migracion. Rechazar en el borde evita que un proyecto de 80 MB llegue a la base de datos.
"""

import re

from pydantic import BaseModel, Field, field_validator, model_validator

# Limites V1. Un proyecto de reto formativo cabe de sobra; un intento de subir un repositorio
# entero o un binario disfrazado de texto no.
MAX_ARCHIVOS = 20
MAX_BYTES_ARCHIVO = 256 * 1024
MAX_BYTES_PROYECTO = 1024 * 1024
EXTENSIONES = (".py", ".txt", ".md", ".json", ".csv", ".toml")

# Rutas relativas POSIX con caracteres ASCII seguros. El contenido si puede ser Unicode.
_RUTA = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_\-./]{0,299}$")


class ArchivoEntrada(BaseModel):
    ruta: str
    contenido: str

    @field_validator("ruta")
    @classmethod
    def _ruta_valida(cls, valor: str) -> str:
        if not _RUTA.match(valor):
            raise ValueError("La ruta solo admite letras ASCII, numeros, guiones, puntos y barras.")
        if valor.startswith("/") or ".." in valor.split("/") or "//" in valor:
            raise ValueError("La ruta debe ser relativa y no puede contener '..'.")
        if not valor.endswith(EXTENSIONES):
            raise ValueError(f"Extension no admitida. Se aceptan: {', '.join(EXTENSIONES)}.")
        return valor

    @field_validator("contenido")
    @classmethod
    def _contenido_valido(cls, valor: str) -> str:
        if "\x00" in valor:
            raise ValueError("El contenido no puede contener bytes nulos.")
        if len(valor.encode("utf-8")) > MAX_BYTES_ARCHIVO:
            raise ValueError(f"Cada archivo admite hasta {MAX_BYTES_ARCHIVO // 1024} KiB.")
        return valor


class GuardarBorrador(BaseModel):
    """`revision_base` es la revision sobre la que el cliente edito.

    Si otra pestana guardo antes, el servidor responde 409 en vez de sobrescribir su trabajo."""

    revision_base: int = Field(ge=0)
    archivos: list[ArchivoEntrada] = Field(min_length=1, max_length=MAX_ARCHIVOS)

    @model_validator(mode="after")
    def _proyecto_valido(self):
        rutas = [a.ruta for a in self.archivos]
        if len(set(rutas)) != len(rutas):
            raise ValueError("Hay rutas repetidas en el proyecto.")
        total = sum(len(a.contenido.encode("utf-8")) for a in self.archivos)
        if total > MAX_BYTES_PROYECTO:
            raise ValueError(f"El proyecto admite hasta {MAX_BYTES_PROYECTO // 1024} KiB en total.")
        return self


class ArchivoSalida(BaseModel):
    ruta: str
    contenido: str
    bytes: int


class EspacioSalida(BaseModel):
    participacion_id: str
    reto_id: str
    titulo_reto: str
    revision: int
    archivos: list[ArchivoSalida]
    bytes_total: int
    momento_guardado: str | None = None
    # Estado derivado, para que el editor sepa que ofrecer sin adivinar.
    puede_enviar: bool
    motivo_bloqueo: str | None = None
