"""Startup retry, timeout and privacy behavior without external PostgreSQL."""

from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import OperationalError

from app.core.config import Settings
from app.db import wait


def settings() -> Settings:
    return Settings(
        database_url="postgresql+psycopg://smoke:private-password@localhost/smoke",
        database_startup_timeout_seconds=4,
        database_startup_retry_seconds=1,
        _env_file=None,
    )


def mock_engine(monkeypatch):
    engine = MagicMock()
    create = MagicMock(return_value=engine)
    monkeypatch.setattr(wait, "create_engine", create)
    return engine, create


def test_ready_database_probes_and_disposes(monkeypatch):
    engine, create = mock_engine(monkeypatch)
    wait.wait_for_database(settings())
    engine.connect.return_value.__enter__.return_value.execute.assert_called_once()
    assert (
        str(
            engine.connect.return_value.__enter__.return_value.execute.call_args.args[0]
        )
        == "SELECT 1"
    )
    assert create.call_args.kwargs["connect_args"]["connect_timeout"] == 3
    assert create.call_args.kwargs["hide_parameters"] is True
    engine.dispose.assert_called_once()


def test_transient_connection_failure_retries(monkeypatch):
    engine, _ = mock_engine(monkeypatch)
    success = engine.connect.return_value
    engine.connect.side_effect = [
        OperationalError("", {}, Exception("offline")),
        success,
    ]
    sleep = MagicMock()
    monkeypatch.setattr(wait.time, "sleep", sleep)
    wait.wait_for_database(settings())
    assert engine.connect.call_count == 2
    sleep.assert_called_once()
    engine.dispose.assert_called_once()


def test_timeout_is_bounded_and_hides_connection_details(monkeypatch, caplog):
    engine, _ = mock_engine(monkeypatch)
    engine.connect.side_effect = OperationalError("", {}, Exception("private-password"))
    now = [0.0]
    monkeypatch.setattr(wait.time, "monotonic", lambda: now[0])
    monkeypatch.setattr(
        wait.time, "sleep", lambda seconds: now.__setitem__(0, now[0] + seconds)
    )
    with pytest.raises(wait.DatabaseStartupTimeout) as error:
        wait.wait_for_database(settings())
    assert now[0] == 4
    assert engine.connect.call_count == 4
    assert "private-password" not in str(error.value) + caplog.text
    engine.dispose.assert_called_once()


def test_main_does_not_start_api_when_database_times_out(monkeypatch):
    monkeypatch.setattr(wait.sys, "argv", ["wait", "--exec-api"])
    monkeypatch.setattr(wait, "get_settings", settings)
    probe = MagicMock(side_effect=wait.DatabaseStartupTimeout())
    monkeypatch.setattr(wait, "wait_for_database", probe)
    execute = MagicMock()
    monkeypatch.setattr(wait.os, "execv", execute)
    assert wait.main() == 1
    execute.assert_not_called()


def test_main_executes_production_api_only_after_readiness(monkeypatch):
    monkeypatch.setattr(wait.sys, "argv", ["wait", "--exec-api"])
    monkeypatch.setattr(wait, "get_settings", settings)
    order = []
    monkeypatch.setattr(wait, "wait_for_database", lambda _: order.append("ready"))
    execute = MagicMock(side_effect=lambda *args: order.append("api"))
    monkeypatch.setattr(wait.os, "execv", execute)
    assert wait.main() == 0
    assert order == ["ready", "api"]
    assert execute.call_args.args[1][1:4] == ["-m", "uvicorn", "app.main:app"]
