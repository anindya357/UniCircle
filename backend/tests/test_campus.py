"""CUET-only campus footprint, seed, and protected read API tests."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import CampusLocation
from app.db.session import get_db
from app.main import create_app
from app.modules.campus.map_data import campus_snapshot, within_campus
from app.modules.campus.seed import seed_campus


@pytest.fixture
def campus_stack(settings) -> Iterator[tuple[TestClient, Session]]:
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


def test_snapshot_contains_only_points_inside_cuet() -> None:
    snapshot = campus_snapshot()
    assert (
        snapshot["map"]["source_url"] == "https://www.openstreetmap.org/way/681604170"
    )
    assert len(snapshot["locations"]) == 24
    assert any(item["osm_id"] > 2**31 for item in snapshot["locations"])
    assert all(
        within_campus(item["latitude"], item["longitude"])
        for item in snapshot["locations"]
    )
    assert not within_campus(22.36, 91.82)  # Chattogram, not CUET Raozan


def test_seed_and_campus_endpoints(campus_stack) -> None:
    client, db = campus_stack
    assert seed_campus(db) == 24
    assert seed_campus(db) == 24
    assert db.scalar(select(func.count()).select_from(CampusLocation)) == 24

    map_response = client.get("/api/v1/campus/map")
    assert map_response.status_code == 200
    campus_map = map_response.json()["data"]
    assert campus_map["name"] == "CUET Raozan Campus"
    assert campus_map["bounds"][0][0] > 22.45
    assert campus_map["bounds"][1][1] < 91.98
    assert len(campus_map["boundary"]) == 32

    listing = client.get("/api/v1/campus/locations")
    assert listing.status_code == 200
    assert len(listing.json()["data"]) == 24
    assert listing.json()["data"][0]["id"] == "teachers-gol-chottor"

    detail = client.get("/api/v1/campus/locations/tsc")
    assert detail.status_code == 200
    assert detail.json()["data"]["name"] == "TSC"
    assert (
        detail.json()["data"]["source_url"]
        == "https://www.openstreetmap.org/node/4504342693"
    )
    assert client.get("/api/v1/campus/locations/unknown").status_code == 404
    assert client.get("/api/v1/campus/locations/BAD!").status_code == 422

    # Even an accidentally inserted out-of-campus row is never returned.
    db.add(
        CampusLocation(
            id="off-campus",
            name="Off campus",
            short_name="OFF",
            category="Landmark",
            address="Elsewhere",
            description="Should not appear",
            details="Should not appear",
            latitude=22.36,
            longitude=91.82,
            osm_type="node",
            osm_id=999,
            sort_order=99,
        )
    )
    db.commit()
    assert len(client.get("/api/v1/campus/locations").json()["data"]) == 24
    assert client.get("/api/v1/campus/locations/off-campus").status_code == 404


def test_campus_requires_authentication(campus_stack) -> None:
    client, _ = campus_stack
    client.app.dependency_overrides.pop(get_current_user)
    assert client.get("/api/v1/campus/map").status_code == 401
    assert client.get("/api/v1/campus/locations").status_code == 401
