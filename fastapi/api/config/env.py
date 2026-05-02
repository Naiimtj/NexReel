from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env from project root (works for local dev).
# In Docker, env vars are injected via env_file — the file not existing is fine.
_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.exists() else None,
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
