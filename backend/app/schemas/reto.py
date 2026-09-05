import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.dominio.enums import CategoriaPrueba, EstadoPreparacion, EstadoReto


class OrganizacionSalida(BaseModel):
    id: uuid.UUID
    nombre: str
    logo: str | None = None
    sitio_web: str | None = None


class PruebaSalida(BaseModel):
    id: uuid.UUID
    nombre: str
    categoria: CategoriaPrueba
    obligatoria: bool
    condicion_aprobacion: str
    limite_ejecucion_ms: int | None = None
    # `referencia_ejecutable` no se expone: es detalle interno de la bateria.


class RetoResumen(BaseModel):
    id: uuid.UUID
    titulo: str
    estado: EstadoReto
    organizacion: OrganizacionSalida
    momento_publicacion: datetime | None = None
    momento_cierre: datetime | None = None
    pruebas_obligatorias: int
    pruebas_totales: int


class RetoDetalle(RetoResumen):
    descripcion_publica: str
    criterios_aceptacion: str
    repositorio_base: str | None = None
    version_base: str | None = None
    pruebas: list[PruebaSalida]


class SolicitudEntrada(BaseModel):
    organizacion_id: uuid.UUID
    titulo_original: str = Field(min_length=4, max_length=500)
    contenido_original: str = Field(min_length=1)


class SolicitudSalida(BaseModel):
    id: uuid.UUID
    titulo_original: str
    estado_preparacion: EstadoPreparacion
    momento_recepcion: datetime
    modelo_ia: str | None = None
    version_instrucciones: str | None = None
    resumen_preparacion: str | None = None
    detalle_error: str | None = None
    reto_borrador_id: uuid.UUID | None = None
    # El contenido original NUNCA se expone (RN-ING-01).


class RetoActualizar(BaseModel):
    titulo: str | None = Field(default=None, min_length=4, max_length=500)
    descripcion_publica: str | None = None
    criterios_aceptacion: str | None = None
    repositorio_base: str | None = None
    version_base: str | None = None
