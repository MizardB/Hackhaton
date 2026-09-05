from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuracion leida de variables de entorno. Ningun valor sensible vive en el codigo."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "local"
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True
    APP_NAME: str = "plataforma"
    APP_VERSION: str = "0.1.0"
    GIT_COMMIT: str = "dev"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./dev.db"

    JWT_SECRET: str = "cambiar-en-produccion"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    CORS_ORIGINS: str = "http://localhost:5173"

    # Implementaciones de los dos puertos del UML
    PREPARADOR: str = "reglas"  # PreparadorIA
    EVALUADOR: str = "simulado"  # EvaluadorAislado: "simulado" o "e2b"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = ""
    # Solo la necesita EVALUADOR=e2b. Vacia con el evaluador simulado, que no sale a la red.
    E2B_API_KEY: str = ""

    PREFIJO_CREDENCIAL: str = "SH"
    URL_BASE_VERIFICACION: str = "http://localhost:5173/#/credenciales"
    SEED_ON_START: bool = False

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
