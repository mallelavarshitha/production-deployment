import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

class Settings(BaseSettings):
    # Standard PostgreSQL variables
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "127.0.0.1"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "taskdb"

    # Support DB_* aliases commonly used in cloud/production environments
    DB_USER: str | None = None
    DB_PASSWORD: str | None = None
    DB_HOST: str | None = None
    DB_PORT: int | None = None
    DB_NAME: str | None = None

    DATABASE_URL: str | None = None
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost"

    model_config = SettingsConfigDict(
        env_file=(str(ROOT_DIR / ".env"), str(BASE_DIR / ".env")),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def effective_host(self) -> str:
        return self.DB_HOST or self.POSTGRES_HOST

    @property
    def effective_port(self) -> int:
        return self.DB_PORT or self.POSTGRES_PORT

    @property
    def effective_user(self) -> str:
        return self.DB_USER or self.POSTGRES_USER

    @property
    def effective_password(self) -> str:
        return self.DB_PASSWORD or self.POSTGRES_PASSWORD

    @property
    def effective_db(self) -> str:
        return self.DB_NAME or self.POSTGRES_DB

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
                url = url.replace("postgresql://", "postgresql+psycopg://", 1)
            return url
        return (
            f"postgresql+psycopg://{self.effective_user}:{self.effective_password}"
            f"@{self.effective_host}:{self.effective_port}/{self.effective_db}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
