"""Campus news publishing, authorization, and notification integration."""

import uuid
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import CampusNewsItem, CampusNewsNotification, User
from app.db.session import get_db
from app.main import create_app


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
        username="news.student",
        email="news@student.cuet.ac.bd",
        password_hash="test",
        role="student",
        university_id="news-001",
        first_name="News",
        last_name="Student",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    teacher = User(
        id=uuid.uuid4(),
        username="news.teacher",
        email="news.teacher@cuet.ac.bd",
        password_hash="test",
        role="teacher",
        university_id="news-teacher-001",
        first_name="News",
        last_name="Teacher",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    unverified = User(
        id=uuid.uuid4(),
        username="news.unverified",
        email="unverified@student.cuet.ac.bd",
        password_hash="test",
        role="student",
        university_id="news-002",
        first_name="Unverified",
        last_name="Student",
        home_address="CUET",
        is_active=True,
    )
    admin = User(
        id=uuid.uuid4(),
        admin_id="news-admin",
        password_hash="test",
        role="admin",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    db.add_all([student, teacher, unverified, admin])
    db.commit()
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
        yield client, db, student, teacher, unverified, admin, current
    db.close()
    engine.dispose()


def payload(*, kind="announcement", status="draft", title="Campus notice"):
    return {
        "type": kind,
        "title": title,
        "summary": "Important information for the CUET community.",
        "content": ["First paragraph.", "Second paragraph."],
        "audience": "CUET community",
        "status": status,
    }


def test_admin_crud_and_published_visibility(stack):
    client, db, student, _, _, admin, current = stack
    assert client.get("/api/v1/news").json()["data"] == []
    assert client.post("/api/v1/admin/news", json=payload()).status_code == 403

    current["user"] = admin
    created = client.post("/api/v1/admin/news", json=payload())
    assert created.status_code == 201
    item_id = created.json()["data"]["id"]
    assert created.json()["data"]["publishedAt"] is None
    assert created.json()["data"]["publishedBy"] == "news-admin"
    assert client.get("/api/v1/admin/news").json()["data"][0]["status"] == "draft"

    current["user"] = student
    assert client.get(f"/api/v1/news/{item_id}").status_code == 404
    assert client.get("/api/v1/news").json()["data"] == []

    current["user"] = admin
    updated_body = payload(status="published", title="Published campus notice")
    updated = client.put(f"/api/v1/admin/news/{item_id}", json=updated_body)
    assert updated.status_code == 200
    assert updated.json()["data"]["publishedAt"] is not None

    second = client.post(
        "/api/v1/admin/news",
        json=payload(kind="news", status="published", title="Newest story"),
    )
    assert second.status_code == 201
    second_id = second.json()["data"]["id"]

    current["user"] = student
    listing = client.get("/api/v1/news")
    assert listing.status_code == 200
    assert [item["id"] for item in listing.json()["data"]] == [second_id, item_id]
    detail = client.get(f"/api/v1/news/{item_id}")
    assert detail.json()["data"]["content"] == updated_body["content"]

    current["user"] = admin
    assert client.delete(f"/api/v1/admin/news/{second_id}").status_code == 204
    assert db.get(CampusNewsItem, uuid.UUID(second_id)) is None


def test_announcement_notifications_are_deduplicated_and_readable(stack):
    client, db, student, teacher, unverified, admin, current = stack
    current["user"] = admin
    created = client.post(
        "/api/v1/admin/news",
        json=payload(kind="update", status="published", title="Library update"),
    )
    item_id = created.json()["data"]["id"]
    assert db.scalar(select(func.count()).select_from(CampusNewsNotification)) == 2
    recipients = set(db.scalars(select(CampusNewsNotification.user_id)).all())
    assert recipients == {student.id, teacher.id}
    assert unverified.id not in recipients
    assert admin.id not in recipients

    # Repeating publication and editing a published item do not duplicate fan-out.
    assert (
        client.put(
            f"/api/v1/admin/news/{item_id}/status", json={"status": "published"}
        ).status_code
        == 200
    )
    assert (
        client.put(
            f"/api/v1/admin/news/{item_id}",
            json=payload(kind="update", status="published", title="Updated title"),
        ).status_code
        == 200
    )
    assert db.scalar(select(func.count()).select_from(CampusNewsNotification)) == 2

    current["user"] = student
    notifications = client.get("/api/v1/notifications/me").json()["data"]
    news_notification = next(
        item for item in notifications if item["type"] == "campus-update"
    )
    assert news_notification["title"] == "Updated title"
    assert news_notification["href"] == f"/news/{item_id}"
    assert news_notification["isRead"] is False
    notification_id = news_notification["id"]
    marked = client.put(f"/api/v1/notifications/{notification_id}/read")
    assert marked.status_code == 200
    assert marked.json()["data"]["readAt"] is not None
    assert client.get("/api/v1/notifications/me").json()["data"][0]["isRead"] is True

    current["user"] = teacher
    assert client.put("/api/v1/notifications/read-all").json()["data"]["updated"] == 1


def test_unpublish_removes_notifications_and_inputs_are_strict(stack):
    client, db, student, _, _, admin, current = stack
    current["user"] = admin
    bad = payload()
    bad["image"] = "not-supported"
    assert client.post("/api/v1/admin/news", json=bad).status_code == 422
    blank = payload()
    blank["content"] = ["   "]
    assert client.post("/api/v1/admin/news", json=blank).status_code == 422

    created = client.post(
        "/api/v1/admin/news", json=payload(status="published")
    ).json()["data"]
    assert db.scalar(select(func.count()).select_from(CampusNewsNotification)) == 2
    assert (
        client.put(
            f"/api/v1/admin/news/{created['id']}/status", json={"status": "draft"}
        ).status_code
        == 200
    )
    assert db.scalar(select(func.count()).select_from(CampusNewsNotification)) == 0

    current["user"] = student
    assert client.get(f"/api/v1/news/{created['id']}").status_code == 404
