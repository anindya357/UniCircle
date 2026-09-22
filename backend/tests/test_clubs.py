"""Club permissions, approval, registration and lifecycle regression tests."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import (
    Club,
    ClubAdmin,
    ClubCreationRequest,
    ClubEvent,
    EventNotification,
    User,
)
from app.db.session import get_db
from app.main import create_app
from app.modules.clubs.notifications import reconcile_event_notifications
from app.modules.clubs.seed import seed_clubs


@pytest.fixture
def stack(settings):
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    db = Session(engine, expire_on_commit=False)
    first = User(
        id=uuid.uuid4(),
        username="first",
        email="u123@student.cuet.ac.bd",
        password_hash="test",
        role="student",
        university_id="u123",
        first_name="First",
        last_name="Student",
        home_address="Campus",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    second = User(
        id=uuid.uuid4(),
        username="second",
        email="u456@student.cuet.ac.bd",
        password_hash="test",
        role="student",
        university_id="u456",
        first_name="Second",
        last_name="Student",
        home_address="Campus",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    owner = User(
        id=uuid.uuid4(),
        admin_id="app-admin",
        password_hash="test",
        role="admin",
        is_active=True,
    )
    db.add_all([first, second, owner])
    db.commit()
    current = {"user": first}
    app = create_app(settings)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: AuthIdentity(
        id=str(current["user"].id),
        role=current["user"].role,
        is_active=True,
        is_verified=True,
    )
    with TestClient(app) as client:
        yield client, db, first, second, owner, current
    db.close()
    engine.dispose()


def event_body(*, paid=False, start=None):
    start = start or datetime.now(UTC) + timedelta(days=1)
    return {
        "title": "Workshop",
        "category": "Learning",
        "summary": "Practice together",
        "location": "CUET",
        "starts_at": start.isoformat(),
        "ends_at": (start + timedelta(hours=2)).isoformat(),
        "registration_enabled": True,
        "is_paid": paid,
        "fee": 100 if paid else 0,
        "bkash_number": "01712345678" if paid else None,
    }


def test_seed_and_admin_permissions(stack):
    client, db, first, second, _, current = stack
    assert seed_clubs(db, first.id) == 10
    assert seed_clubs(db, first.id) == 10
    assert db.scalar(select(func.count()).select_from(ClubAdmin)) == 10
    assert len(client.get("/api/v1/clubs").json()["data"]) == 10
    club = "cuet-computer-club"
    assert client.get("/api/v1/clubs/administered").status_code == 200
    assert client.delete(f"/api/v1/clubs/{club}/admins/{first.id}").status_code == 409
    current["user"] = second
    assert (
        client.post(f"/api/v1/clubs/{club}/events", json=event_body()).status_code
        == 403
    )
    current["user"] = first
    assert (
        client.post(
            f"/api/v1/clubs/{club}/admins", json={"student_id": second.university_id}
        ).status_code
        == 200
    )
    assert client.delete(f"/api/v1/clubs/{club}/admins/{first.id}").status_code == 200
    current["user"] = second
    assert client.get("/api/v1/clubs/administered").json()["data"][0]["id"] == club


def test_club_request_review_is_private_and_idempotent(stack):
    client, db, first, second, owner, current = stack
    proposal = {
        "name": "CUET Art Circle",
        "short_name": "CAC",
        "category": "Arts",
        "tagline": "Make art",
        "description": "Student artists",
        "purpose": "Give student artists a place to collaborate.",
        "activities": ["Workshops"],
    }
    response = client.post("/api/v1/clubs/requests", json=proposal)
    assert response.status_code == 201
    request_id = response.json()["data"]["id"]
    assert db.get(ClubCreationRequest, uuid.UUID(request_id)).status == "pending"
    assert client.get("/api/v1/clubs/cuet-art-circle").status_code == 404
    current["user"] = second
    assert client.get("/api/v1/clubs/requests/mine").json()["data"] == []
    assert client.get("/api/v1/admin/club-requests").status_code == 403
    current["user"] = owner
    assert (
        client.get("/api/v1/admin/club-requests?status=pending").json()["data"]["total"]
        == 1
    )
    reviewed = client.post(
        f"/api/v1/admin/club-requests/{request_id}/review",
        json={"decision": "approved"},
    )
    assert reviewed.status_code == 200
    club_id = reviewed.json()["data"]["approvedClubId"]
    assert (
        client.post(
            f"/api/v1/admin/club-requests/{request_id}/review",
            json={"decision": "approved"},
        ).status_code
        == 200
    )
    assert (
        client.post(
            f"/api/v1/admin/club-requests/{request_id}/review",
            json={"decision": "rejected"},
        ).status_code
        == 409
    )
    assert (
        db.scalar(select(func.count()).select_from(Club).where(Club.id == club_id)) == 1
    )
    assert db.get(ClubAdmin, (club_id, first.id)) is not None


def test_paid_registration_and_event_notifications(stack):
    client, db, first, second, _, current = stack
    seed_clubs(db, first.id)
    club = "cuet-computer-club"
    event = client.post(f"/api/v1/clubs/{club}/events", json=event_body(paid=True))
    assert event.status_code == 201
    event_id = event.json()["data"]["id"]
    current["user"] = second
    body = {
        "participant_name": "Second Student",
        "email": second.email,
        "student_id": second.university_id,
        "department_name": "CSE",
    }
    assert (
        client.post(f"/api/v1/events/{event_id}/registrations", json=body).status_code
        == 422
    )
    body["bkash_trx_id"] = "ABC12345"
    registered = client.post(f"/api/v1/events/{event_id}/registrations", json=body)
    assert registered.status_code == 201
    assert registered.json()["data"]["paymentStatus"] == "pending_review"
    assert (
        client.post(f"/api/v1/events/{event_id}/registrations", json=body).status_code
        == 409
    )
    assert (
        client.get(f"/api/v1/events/{event_id}").json()["data"]["registeredCount"] == 1
    )
    assert client.get(f"/api/v1/events/{event_id}/registrations").status_code == 403
    assert (
        client.put(
            f"/api/v1/events/{event_id}/interest", json={"status": "going"}
        ).status_code
        == 200
    )
    assert (
        client.put(
            f"/api/v1/events/{event_id}/interest", json={"status": "going"}
        ).status_code
        == 200
    )
    assert reconcile_event_notifications(db, datetime.now(UTC)) == 0
    end = db.get(ClubEvent, uuid.UUID(event_id)).ends_at
    future = end.replace(tzinfo=UTC) + timedelta(seconds=1)
    assert reconcile_event_notifications(db, future) == 2
    assert reconcile_event_notifications(db, future) == 0
    assert db.scalar(select(func.count()).select_from(EventNotification)) == 2
    assert len(client.get("/api/v1/notifications/events/me").json()["data"]) == 2
    current["user"] = first
    assert (
        len(client.get(f"/api/v1/events/{event_id}/registrations").json()["data"]) == 1
    )
    registration_id = registered.json()["data"]["id"]
    reviewed = client.put(
        f"/api/v1/events/{event_id}/registrations/{registration_id}/payment",
        json={"status": "verified"},
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["data"]["paymentStatus"] == "verified"


def test_notification_exact_start_end_boundaries(stack):
    client, db, first, _, _, _ = stack
    seed_clubs(db, first.id)
    start = datetime.now(UTC) + timedelta(days=2)
    response = client.post(
        "/api/v1/clubs/cuet-computer-club/events", json=event_body(start=start)
    )
    assert response.status_code == 201
    event_id = response.json()["data"]["id"]
    assert (
        client.put(
            f"/api/v1/events/{event_id}/interest", json={"status": "interested"}
        ).status_code
        == 200
    )
    assert reconcile_event_notifications(db, start - timedelta(microseconds=1)) == 0
    assert reconcile_event_notifications(db, start) == 1
    end = start + timedelta(hours=2)
    assert reconcile_event_notifications(db, end - timedelta(microseconds=1)) == 0
    assert reconcile_event_notifications(db, end) == 1
    assert reconcile_event_notifications(db, end) == 0
