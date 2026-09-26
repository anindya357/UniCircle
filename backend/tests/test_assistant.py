"""Campus AI Assistant source policy, retrieval, and API contracts."""

import uuid
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import RagChunk, RagSource, User
from app.main import create_app
from app.modules.assistant.policy import SourcePolicy
from app.modules.assistant.router import get_assistant_service
from app.modules.assistant.service import RagAssistantService


class FakeEmbeddings:
    def embed_query(self, _text: str) -> list[float]:
        return [1.0, 0.0]


class FakeChat:
    def answer(self, *, question: str, context: str) -> str:
        assert question == "Where is CUET?"
        assert "Raozan" in context
        return "CUET is in Raozan, Chattogram. [1]"


class FakeRouteService:
    def ask(self, user_id: str, question: str) -> dict:
        assert uuid.UUID(user_id)
        return {
            "answer": f"Grounded answer for: {question}",
            "status": "answered",
            "sources": [
                {
                    "id": "source-1",
                    "title": "CUET",
                    "context": "Official CUET information",
                    "href": "https://cuet.ac.bd/",
                }
            ],
        }


@pytest.fixture
def assistant_stack(settings):
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    db = Session(engine, expire_on_commit=False)
    user = User(
        id=uuid.uuid4(),
        username="assistant.student",
        email="assistant@student.cuet.ac.bd",
        password_hash="test",
        role="student",
        university_id="assistant-001",
        first_name="Assistant",
        last_name="Student",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )
    db.add(user)
    db.commit()
    yield db, user, settings
    db.close()
    engine.dispose()


def test_source_policy_restricts_hosts_protocols_and_portals():
    policy = SourcePolicy(("cuet.ac.bd",))
    assert policy.canonicalize("https://cuet.ac.bd/department/cse#faculty") == (
        "https://cuet.ac.bd/department/cse"
    )
    assert policy.canonicalize("/notice/example", base_url="https://cuet.ac.bd/") == (
        "https://cuet.ac.bd/notice/example"
    )
    assert policy.canonicalize("http://cuet.ac.bd/") is None
    assert policy.canonicalize("https://evil.example/") is None
    assert policy.canonicalize("https://cuet.ac.bd/admin/users") is None
    assert policy.canonicalize("https://cuet.ac.bd/logo.png") is None
    assert policy.canonicalize("https://cuet.ac.bd/files/notice.pdf") is not None


def test_grounded_retrieval_returns_source(assistant_stack):
    db, user, settings = assistant_stack
    source = RagSource(
        url="https://cuet.ac.bd/about",
        title="About CUET",
        content_type="text/html",
        content_hash="a" * 64,
        status="active",
        crawled_at=datetime.now(UTC),
        source_metadata={"loader": "WebBaseLoader"},
    )
    db.add(source)
    db.flush()
    db.add(
        RagChunk(
            source_id=source.id,
            chunk_index=0,
            content="CUET is situated in Raozan, Chattogram.",
            content_hash="b" * 64,
            embedding=[1.0, 0.0],
        )
    )
    db.commit()
    service = RagAssistantService(
        db, settings, embeddings=FakeEmbeddings(), chat=FakeChat()
    )

    result = service.ask(str(user.id), "Where is CUET?")

    assert result["status"] == "answered"
    assert result["sources"][0]["href"] == "https://cuet.ac.bd/about"
    assert "[1]" in result["answer"]


def test_empty_knowledge_returns_not_found_without_openai(assistant_stack):
    db, user, settings = assistant_stack
    service = RagAssistantService(db, settings)

    result = service.ask(str(user.id), "What is available?")

    assert result["status"] == "not-found"
    assert result["sources"] == []


def test_assistant_endpoint_is_authenticated_and_validated(settings):
    app = create_app(settings)
    user_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user] = lambda: AuthIdentity(
        id=user_id, role="student", is_active=True, is_verified=True
    )
    app.dependency_overrides[get_assistant_service] = lambda: FakeRouteService()
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/assistant/ask", json={"question": " Where is CUET? "}
        )
        invalid = client.post("/api/v1/assistant/ask", json={"question": " "})

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "answered"
    assert invalid.status_code == 422
