"""Entorno de Alembic.

La URL sale de la configuracion de la aplicacion (variable de entorno), nunca del .ini:
asi la misma migracion corre en local sobre SQLite y en produccion sobre Postgres sin editar
ningun archivo, y no hay credenciales en el repositorio.
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

import app.models  # noqa: F401  -- registra todas las tablas en Base.metadata
from alembic import context
from app.core.config import get_settings
from app.core.database import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ConfigParser trata "%" como marca de interpolacion. Se duplica antes de entregar la URL
# para que una contrasena percent-encoded (por ejemplo %40) no rompa la lectura del .ini;
# SQLAlchemy recibe el valor original y la decodifica.
config.set_main_option("sqlalchemy.url", get_settings().DATABASE_URL.replace("%", "%%"))
target_metadata = Base.metadata


def render_item(tipo, obj, autogen_context):
    """MomentoUTC se escribe en la migracion como su implementacion estandar.

    Asi el archivo de migracion no depende del codigo de la aplicacion."""
    if tipo == "type" and obj.__class__.__name__ == "MomentoUTC":
        autogen_context.imports.add("import sqlalchemy as sa")
        return "sa.DateTime(timezone=True)"
    return False


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        render_item=render_item,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_item=render_item,
            # SQLite no sabe alterar columnas; el batch mode lo resuelve recreando la tabla.
            render_as_batch=connection.dialect.name == "sqlite",
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
