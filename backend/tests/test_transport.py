"""Transport seed, public schedule boundaries, and Admin authorization."""

import uuid
from datetime import UTC, date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import BusDriver, TransportBus, TransportSchedule, User
from app.db.session import get_db
from app.main import create_app
from app.modules.transport.seed import seed_transport


@pytest.fixture
def stack(settings):
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    db = Session(engine, expire_on_commit=False)
    student = User(
        id=uuid.uuid4(),
        username="transport.student",
        email="transport@student.cuet.ac.bd",
        password_hash="test",
        role="student",
        university_id="transport-001",
        first_name="Transport",
        last_name="Student",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    admin = User(
        id=uuid.uuid4(),
        admin_id="transport-admin",
        password_hash="test",
        role="admin",
        is_active=True,
    )
    db.add_all([student, admin])
    db.commit()
    counts = seed_transport(db)
    current = {"user": student}
    app = create_app(settings)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: AuthIdentity(
        id=str(current["user"].id),
        role=current["user"].role,
        is_active=True,
        is_verified=True,
    )
    with TestClient(app) as client:
        yield client, db, student, admin, current, counts
    db.close()
    engine.dispose()


def test_seed_uses_only_pdf_driver_rows_and_assigns_every_driver(stack):
    client, db, _, _, _, counts = stack
    assert counts == {"routes": 3, "buses": 20, "drivers": 25, "schedules": 37}
    drivers = db.scalars(select(BusDriver).order_by(BusDriver.source_row)).all()
    assert [item.source_row for item in drivers] == list(range(7, 32))
    assert drivers[0].name == "Md. Khorshed Alam"
    assert drivers[0].phone == "01672735883"
    assert drivers[-1].name == "Md. Rashed"
    assert drivers[-1].phone == "01828909585"
    assert all(item.assigned_bus_id for item in drivers)
    assert db.scalar(select(func.count()).select_from(TransportBus)) == 20
    response = client.get("/api/v1/transport/drivers")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 25
    assert "Abdul Karim" not in {item["name"] for item in response.json()["data"]}


def test_general_schedule_is_current_or_future_only(stack):
    client, _, _, _, _, _ = stack
    response = client.get("/api/v1/transport/snapshot?days=2")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["referenceDate"] == date.today().isoformat()
    assert len(data["availableDates"]) == 2
    assert (
        len(
            [item for item in data["trips"] if item["date"] == date.today().isoformat()]
        )
        == 4
    )
    morning = data["trips"][0]
    assert sum(len(group["busIds"]) for group in morning["assignments"]) == 11
    assert sum(len(group["driverIds"]) for group in morning["assignments"]) == 11
    past = date.today() - timedelta(days=1)
    assert (
        client.get(f"/api/v1/transport/schedules?service_date={past}").status_code
        == 422
    )
    assert (
        client.get(f"/api/v1/transport/snapshot?start_date={past}").status_code == 422
    )


def test_only_admin_can_manage_schedules_drivers_routes_and_buses(stack):
    client, db, _, admin, current, _ = stack
    snapshot_url = "/api/v1/admin/transport"
    assert client.get(snapshot_url).status_code == 403
    current["user"] = admin
    data = client.get(snapshot_url).json()["data"]
    assert len(data["drivers"]) == 25
    assert len(data["schedules"]) == 37
    driver = data["drivers"][0]
    updated = client.put(
        f"/api/v1/admin/transport/drivers/{driver['id']}",
        json={
            "name": driver["name"],
            "phone": driver["phone"],
            "driver_class": driver["driverClass"],
            "assigned_bus_id": "meghna",
            "is_active": True,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["assignedBusName"] == "Meghna"
    schedule = data["schedules"][0]
    changed_title = "Admin-updated transport run"
    saved = client.put(
        f"/api/v1/admin/transport/schedules/{schedule['id']}",
        json={
            "title": changed_title,
            "service_date": schedule["serviceDate"],
            "start_time": schedule["startTime"],
            "end_time": schedule["endTime"],
            "direction": schedule["direction"],
            "origin": schedule["origin"],
            "destination": schedule["destination"],
            "route_id": schedule["routeId"],
            "bus_id": schedule["busId"],
            "driver_id": schedule["driverId"],
            "recurrence": schedule["recurrence"],
            "recurrence_until": schedule["recurrenceUntil"],
            "is_active": True,
        },
    )
    assert saved.status_code == 200
    assert saved.json()["data"]["title"] == changed_title
    assert db.get(TransportSchedule, uuid.UUID(schedule["id"])).title == changed_title

    route = client.post(
        "/api/v1/admin/transport/routes",
        json={
            "id": "test-route",
            "name": "Test route",
            "outbound_stops": ["CUET", "Test stop"],
            "return_stops": ["Test stop", "CUET"],
        },
    )
    assert route.status_code == 201
    bus = client.post(
        "/api/v1/admin/transport/buses",
        json={
            "id": "test-bus",
            "name": "Test Bus",
            "bus_type": "staff",
            "registration": "CUET-TEST",
        },
    )
    assert bus.status_code == 201
    driver = client.post(
        "/api/v1/admin/transport/drivers",
        json={
            "name": "Test Driver",
            "phone": "01700000001",
            "driver_class": "heavy",
            "assigned_bus_id": "test-bus",
        },
    )
    assert driver.status_code == 201
    driver_id = driver.json()["data"]["id"]
    new_schedule = client.post(
        "/api/v1/admin/transport/schedules",
        json={
            "title": "One-time test run",
            "service_date": (date.today() + timedelta(days=1)).isoformat(),
            "start_time": "23:00",
            "end_time": "23:30",
            "direction": "round-trip",
            "origin": "CUET",
            "destination": "Test stop and return",
            "route_id": "test-route",
            "bus_id": "test-bus",
            "driver_id": driver_id,
            "recurrence": "once",
        },
    )
    assert new_schedule.status_code == 201
    schedule_id = new_schedule.json()["data"]["id"]
    assert (
        client.delete(f"/api/v1/admin/transport/schedules/{schedule_id}").status_code
        == 204
    )
    assert (
        client.delete(f"/api/v1/admin/transport/drivers/{driver_id}").status_code == 204
    )
    assert client.delete("/api/v1/admin/transport/buses/test-bus").status_code == 204
    assert client.delete("/api/v1/admin/transport/routes/test-route").status_code == 204
