from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import usuario_actual
from app.core.config import get_settings
from app.core.database import get_db
from app.core.errors import ErrorDominio
from app.core.security import crear_token, hash_password, verificar_password
from app.models import PerfilEstudiante, Usuario
from app.models._base import ahora
from app.schemas.identidad import (
    LoginEntrada,
    PerfilActualizar,
    PerfilSalida,
    RegistroEntrada,
    RepresentacionSalida,
    TokenSalida,
    UsuarioSalida,
)
from app.servicios import seguridad

router = APIRouter()
settings = get_settings()


def a_salida(usuario: Usuario) -> UsuarioSalida:
    momento = ahora()
    return UsuarioSalida(
        id=usuario.id,
        correo=usuario.correo,
        nombre=usuario.nombre,
        tiene_perfil_estudiante=usuario.perfil is not None,
        representaciones=[
            RepresentacionSalida(
                organizacion_id=r.organizacion_id,
                organizacion=r.organizacion.nombre,
                funcion_autorizada=r.funcion_autorizada,
            )
            for r in usuario.representaciones
            if r.esta_activa(momento)
        ],
    )


@router.post("/registro", response_model=UsuarioSalida, status_code=status.HTTP_201_CREATED)
def registro(datos: RegistroEntrada, db: Session = Depends(get_db)):
    if db.scalar(select(Usuario).where(Usuario.correo == datos.correo)):
        raise ErrorDominio("CORREO_YA_REGISTRADO", "Ese correo ya tiene una cuenta.", http=409)

    usuario = Usuario(
        correo=datos.correo,
        hash_password=hash_password(datos.password),
        nombre=datos.nombre,
    )
    db.add(usuario)
    db.flush()

    if datos.perfil_estudiante is not None:
        d = datos.perfil_estudiante
        db.add(
            PerfilEstudiante(
                usuario_id=usuario.id,
                nombre_publico=d.nombre_publico or datos.nombre,
                universidad=d.universidad,
                carrera=d.carrera,
                ciclo=d.ciclo,
            )
        )
    db.commit()
    db.refresh(usuario)
    return a_salida(usuario)


@router.post("/login", response_model=TokenSalida)
def login(datos: LoginEntrada, db: Session = Depends(get_db)):
    usuario = db.scalar(select(Usuario).where(Usuario.correo == datos.correo))
    if usuario is None or not verificar_password(datos.password, usuario.hash_password):
        raise ErrorDominio("CREDENCIALES_INVALIDAS", "Correo o contrasena incorrectos.", http=401)

    return TokenSalida(
        access_token=crear_token(str(usuario.id), "usuario"),
        expira_en=settings.JWT_EXPIRE_MINUTES * 60,
        usuario=a_salida(usuario),
    )


@router.get("/yo", response_model=UsuarioSalida)
def yo(usuario: Usuario = Depends(usuario_actual)):
    return a_salida(usuario)


@router.get("/yo/perfil", response_model=PerfilSalida)
def mi_perfil(usuario: Usuario = Depends(usuario_actual), db: Session = Depends(get_db)):
    return PerfilSalida.model_validate(seguridad.perfil_propio(db, usuario), from_attributes=True)


@router.patch("/yo/perfil", response_model=PerfilSalida)
def actualizar_perfil(
    datos: PerfilActualizar, usuario: Usuario = Depends(usuario_actual), db: Session = Depends(get_db)
):
    perfil = seguridad.perfil_propio(db, usuario)
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(perfil, campo, valor)
    db.commit()
    db.refresh(perfil)
    return PerfilSalida.model_validate(perfil, from_attributes=True)
