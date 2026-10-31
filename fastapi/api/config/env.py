from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Load generic vars from repo-root .env, then service-specific fastapi/.env
# (later file wins). In Docker these are injected via env_file/environment.
_REPO_ROOT = Path(__file__).resolve().parents[3]
_FASTAPI_DIR = Path(__file__).resolve().parents[2]
_ENV_FILES = tuple(
    str(p) for p in (_REPO_ROOT / ".env", _FASTAPI_DIR / ".env") if p.exists()
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES or None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "nexreel"
    POSTGRES_USER: str = "nexreel"
    POSTGRES_PASSWORD: str = "nexreel"
    DATABASE_URL: str | None = None
    SESSION_SECRET: str = "change-me"
    BACKUP_ADMIN_PASSWORD: str = "change-me"
    BACKUP_DATA_DIR: str = "../database/backup_data"
    ALLOWED_ORIGINS: str = "http://127.0.0.1:5173,http://127.0.0.1:5172,http://localhost:5173,http://localhost:5172"
    CLOUDINARY_KEY: str = ""
    CLOUDINARY_SECRET: str = ""
    PLEX_URL: str = ""
    PLEX_API_KEY: str = ""
    TZ: str = "Europe/Madrid"
    ADMIN_EMAIL: str = ""
    ADMIN_USER: str = ""
    ADMIN_PASSWORD: str = ""

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL

        from urllib.parse import quote_plus

        password = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{password}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def cors_allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
