"""Directory seed and protected read API regression tests."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import Department, FacultyDirectoryEntry
from app.db.session import get_db
from app.main import create_app
from app.modules.directory.seed import seed_directory


@pytest.fixture
def directory_stack(settings) -> Iterator[tuple[TestClient, Session]]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    db = Session(engine, expire_on_commit=False)
    app = create_app(settings)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: AuthIdentity(
        id="test-user", role="student", is_active=True, is_verified=True
    )
    with TestClient(app) as client:
        yield client, db
    db.close()
    engine.dispose()


def test_seed_idempotence_and_shared_faculty(directory_stack) -> None:
    _, db = directory_stack
    assert seed_directory(db) == (12, 292)
    assert seed_directory(db) == (12, 292)
    assert db.scalar(select(func.count()).select_from(Department)) == 12
    assert db.scalar(select(func.count()).select_from(FacultyDirectoryEntry)) == 292
    assert db.get(FacultyDirectoryEntry, "eee-6174") is not None
    assert db.get(FacultyDirectoryEntry, "bme-6174") is not None
    assert db.get(Department, "wre") is not None
    assert db.get(Department, "mme") is not None


def test_directory_endpoints_and_validation(directory_stack) -> None:
    client, db = directory_stack
    seed_directory(db)
    listing = client.get("/api/v1/departments")
    assert listing.status_code == 200
    departments = listing.json()["data"]
    assert len(departments) == 12
    assert {item["code"] for item in departments} == {
        "cse",
        "eee",
        "me",
        "ce",
        "ete",
        "bme",
        "mme",
        "mie",
        "pme",
        "wre",
        "architecture",
        "urp",
    }
    for department in departments:
        code = department["code"]
        assert client.get(f"/api/v1/departments/{code}").status_code == 200
        assert len(
            client.get(f"/api/v1/departments/{code}/faculty").json()["data"]
        ) == len(department["faculty"])
    assert departments[0]["code"] == "cse"
    assert len(departments[0]["faculty"]) == 39
    assert departments[0]["source_url"] == "https://cuet.ac.bd/department/cse"
    cse = client.get("/api/v1/departments/cse")
    assert cse.status_code == 200
    assert cse.json()["data"]["office_email"] == "headcse@cuet.ac.bd"
    faculty = client.get("/api/v1/departments/cse/faculty")
    assert faculty.status_code == 200
    assert any(
        item["name"] == "Prof. Dr. Kaushik Deb" for item in faculty.json()["data"]
    )
    detail = client.get("/api/v1/faculty/cse-6439")
    assert detail.status_code == 200
    assert detail.json()["data"]["designation"] == "Professor"
    assert client.get("/api/v1/departments/unknown").status_code == 404
    assert client.get("/api/v1/faculty/cse-999999").status_code == 404
    assert client.get("/api/v1/departments/CSE").status_code == 422
    assert client.get("/api/v1/faculty/not-valid-id").status_code == 422


def test_directory_requires_authentication(directory_stack) -> None:
    client, _ = directory_stack
    client.app.dependency_overrides.pop(get_current_user)
    assert client.get("/api/v1/departments").status_code == 401
