from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ErrorDominio(Exception):
    """Error de negocio con codigo estable, pensado para que el frontend ramifique sobre `codigo`."""

    def __init__(self, codigo: str, mensaje: str, http: int = 400, detalles: dict | None = None):
        self.codigo = codigo
        self.mensaje = mensaje
        self.http = http
        self.detalles = detalles or {}
        super().__init__(mensaje)


def _envoltura(codigo: str, mensaje: str, detalles: dict | None = None) -> dict:
    return {"error": {"codigo": codigo, "mensaje": mensaje, "detalles": detalles or {}}}


def registrar_manejadores(app: FastAPI) -> None:
    @app.exception_handler(ErrorDominio)
    async def _dominio(_: Request, exc: ErrorDominio):
        return JSONResponse(status_code=exc.http, content=_envoltura(exc.codigo, exc.mensaje, exc.detalles))

    @app.exception_handler(RequestValidationError)
    async def _validacion(_: Request, exc: RequestValidationError):
        # `exc.errors()` trae en `ctx` la excepcion original que levanto cada validador propio,
        # y una excepcion no es serializable a JSON. Sin convertirla, un archivo con extension
        # no admitida o una ruta con `..` revienta el manejador y el cliente recibe un fallo del
        # servidor en lugar del 422 que promete el contrato.
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_envoltura(
                "VALIDACION", "La peticion no cumple el esquema.", {"errores": jsonable_encoder(exc.errors())}
            ),
        )
