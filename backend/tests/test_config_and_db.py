"""Settings and ORM foundation checks that do not mutate PostgreSQL."""

import pytest
from pydantic import ValidationError
from sqlalchemy import DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.config import LOCAL_DATABASE_URL, Settings
from app.db.base import Base, TimestampMixin


def test_development_cors_has_only_configured_loopback_pair() -> None:
    settings = Settings(
        app_env="development",
        frontend_url="http://localhost:3000",
        database_url=LOCAL_DATABASE_URL,
        _env_file=None,
    )
    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@pytest.mark.parametrize("app_env", ["testing", "production"])
def test_non_development_requires_explicit_database(app_env: str) -> None:
    with pytest.raises(ValidationError, match="explicit DATABASE_URL"):
        Settings(app_env=app_env, database_url=LOCAL_DATABASE_URL, _env_file=None)


def test_database_driver_must_be_psycopg() -> None:
    with pytest.raises(ValidationError, match=r"postgresql\+psycopg"):
        Settings(database_url="sqlite:///:memory:", _env_file=None)


def test_timestamp_mixin_is_opt_in_and_tz_aware() -> None:
    class Example(TimestampMixin, Base):
        __tablename__ = "test_only_example"

        id: Mapped[int] = mapped_column(Integer, primary_key=True)

    assert isinstance(Example.__table__.c.created_at.type, DateTime)
    assert Example.__table__.c.created_at.type.timezone is True
    assert Example.__table__.c.updated_at.type.timezone is True
    assert Base.metadata.naming_convention["pk"] == "pk_%(table_name)s"
    Base.metadata.remove(Example.__table__)
