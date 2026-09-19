"""Backend-only settings; browser code must not import this module."""

from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit, urlunsplit

from pydantic import Field, HttpUrl, SecretStr, model_validator
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
    jwt_secret: SecretStr | None = None
    jwt_issuer: str = "unicircle-api"
    jwt_audience: str = "unicircle-web"
    jwt_access_token_minutes: int = Field(default=30, ge=1, le=1440)
    otp_pepper: SecretStr | None = None
    otp_expiry_minutes: int = Field(default=10, ge=1, le=30)
    otp_resend_cooldown_seconds: int = Field(default=60, ge=10, le=3600)
    otp_max_attempts: int = Field(default=5, ge=1, le=10)
    smtp_host: str | None = None
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_tls_mode: Literal["starttls", "ssl"] = "starttls"
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_from_email: str | None = None

    @model_validator(mode="after")
    def validate_database_configuration(self) -> "Settings":
        if not self.database_url.startswith("postgresql+psycopg://"):
            raise ValueError("DATABASE_URL must use the postgresql+psycopg driver")
        if self.app_env != "development" and self.database_url == LOCAL_DATABASE_URL:
            raise ValueError("Testing and production require an explicit DATABASE_URL")
        if self.app_env == "production":
            self.require_jwt_key()
            self.require_otp_key()
            self.require_smtp_configuration()
        return self

    @staticmethod
    def _required_key(value: SecretStr | None, name: str) -> bytes:
        raw = value.get_secret_value() if value else ""
        if len(raw.encode("utf-8")) < 32 or raw.startswith("replace-"):
            raise ValueError(f"{name} must be a configured secret of at least 32 bytes")
        return raw.encode("utf-8")

    def require_jwt_key(self) -> bytes:
        return self._required_key(self.jwt_secret, "JWT_SECRET")

    def require_otp_key(self) -> bytes:
        return self._required_key(self.otp_pepper, "OTP_PEPPER")

    def require_smtp_configuration(self) -> tuple[str, int, str, str, str, str]:
        host = self.smtp_host or ""
        username = self.smtp_username or ""
        password = self.smtp_password.get_secret_value() if self.smtp_password else ""
        sender = self.smtp_from_email or ""
        if (
            not host
            or host.endswith(".example.com")
            or not username
            or username == "replace-me"
            or not password
            or password == "replace-me"
            or not sender
            or sender.endswith("@example.com")
        ):
            raise ValueError("SMTP configuration is incomplete")
        return host, self.smtp_port, username, password, sender, self.smtp_tls_mode

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
