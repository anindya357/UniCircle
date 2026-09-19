"""Backend-only settings; browser code must not import this module."""

from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit, urlunsplit

from pydantic import HttpUrl, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
REPOSITORY_ROOT = BACKEND_ROOT.parent
LOCAL_DATABASE_URL = "postgresql+psycopg://unicircle_dev@localhost:5432/unicircle_dev"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPOSITORY_ROOT / ".env", BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "testing", "production"] = "development"
    frontend_url: HttpUrl = HttpUrl("http://localhost:3000")
    database_url: str = LOCAL_DATABASE_URL

    @model_validator(mode="after")
    def validate_database_configuration(self) -> "Settings":
        if not self.database_url.startswith("postgresql+psycopg://"):
            raise ValueError("DATABASE_URL must use the postgresql+psycopg driver")
        if self.app_env != "development" and self.database_url == LOCAL_DATABASE_URL:
            raise ValueError("Testing and production require an explicit DATABASE_URL")
        return self

    @property
    def cors_origins(self) -> list[str]:
        configured = str(self.frontend_url).rstrip("/")
        origins = [configured]
        if self.app_env == "development":
            parts = urlsplit(configured)
            loopback = {"localhost": "127.0.0.1", "127.0.0.1": "localhost"}
            alternate_host = loopback.get(parts.hostname or "")
            if alternate_host:
                alternate_netloc = alternate_host
                if parts.port:
                    alternate_netloc = f"{alternate_host}:{parts.port}"
                origins.append(urlunsplit((parts.scheme, alternate_netloc, "", "", "")))
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
