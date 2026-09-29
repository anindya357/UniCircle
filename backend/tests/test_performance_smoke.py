"""Generous local latency budgets for the busiest read paths."""

import uuid
from datetime import UTC, datetime
from time import perf_counter

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import (
    Conversation,
    ForumPost,
    Message,
    Notification,
    ResourceRequest,
    User,
)
from app.db.session import get_db
from app.main import create_app
from app.modules.directory.seed import seed_directory
from app.modules.transport.seed import seed_transport

LATENCY_BUDGET_SECONDS = 3.0


@pytest.fixture
def performance_stack(settings):
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    db = Session(engine, expire_on_commit=False)
    reader = User(
        id=uuid.uuid4(),
        username="performance.reader",
        email="performance@student.cuet.ac.bd",
        password_hash="argon2-test-hash",
        role="student",
        university_id="perf-001",
        first_name="Performance",
        last_name="Reader",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    peer = User(
        id=uuid.uuid4(),
        username="performance.peer",
        email="peer@student.cuet.ac.bd",
        password_hash="argon2-test-hash",
        role="student",
        university_id="perf-002",
        first_name="Performance",
        last_name="Peer",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    db.add_all([reader, peer])
    db.flush()
    request = ResourceRequest(
        requester_id=reader.id,
        recipient_id=peer.id,
        category="notebook",
        resource_name="Course notes",
        description="Shared notes",
        status="accepted",
    )
    db.add(request)
    db.flush()
    conversation = Conversation(resource_request_id=request.id)
    db.add(conversation)
    db.flush()
    db.add_all(
        [
            Message(
                conversation_id=conversation.id,
                sender_id=reader.id if index % 2 == 0 else peer.id,
                body=f"Message {index}",
            )
            for index in range(80)
        ]
        + [
            ForumPost(author_id=reader.id, body=f"Campus discussion {index}")
            for index in range(80)
        ]
        + [
            Notification(
                recipient_id=reader.id,
                type="announcement",
                title=f"Notice {index}",
                message="Campus update",
                dedupe_key=f"perf:{index}",
            )
            for index in range(80)
        ]
    )
    db.commit()
    seed_directory(db)
    seed_transport(db)
    app = create_app(settings)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: AuthIdentity(
        id=str(reader.id), role="student", is_active=True, is_verified=True
    )
    with TestClient(app) as client:
        yield client, conversation.id
    db.close()
    engine.dispose()


def timed_get(client: TestClient, path: str) -> tuple[float, dict]:
    started = perf_counter()
    response = client.get(path)
    elapsed = perf_counter() - started
    assert response.status_code == 200
    assert elapsed < LATENCY_BUDGET_SECONDS
    return elapsed, response.json()["data"]


def test_list_query_latency_and_pagination(performance_stack):
    client, conversation_id = performance_stack
    _, departments = timed_get(client, "/api/v1/departments")
    _, forum = timed_get(client, "/api/v1/forum/posts?limit=20&offset=20")
    _, messages = timed_get(
        client, f"/api/v1/conversations/{conversation_id}/messages?limit=25"
    )
    _, transport = timed_get(client, "/api/v1/transport/snapshot?days=2")
    _, notifications = timed_get(client, "/api/v1/notifications/me?limit=20&offset=20")

    assert len(departments) == 12
    assert len(forum["posts"]) == 20 and forum["limit"] == 20
    assert len(messages["items"]) == 25 and messages["hasMore"] is True
    assert len(transport["availableDates"]) == 2
    assert len(notifications) == 20


def test_list_limits_reject_unbounded_requests(performance_stack):
    client, conversation_id = performance_stack
    paths = (
        "/api/v1/forum/posts?limit=101",
        f"/api/v1/conversations/{conversation_id}/messages?limit=101",
        "/api/v1/notifications/me?limit=101",
    )
    assert all(client.get(path).status_code == 422 for path in paths)
