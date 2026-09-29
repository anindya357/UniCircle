"""Campus AI Assistant source policy, retrieval, and API contracts."""

import uuid
from datetime import UTC, datetime

import pytest
from bs4 import BeautifulSoup
from fastapi.testclient import TestClient
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.core.errors import AppError
from app.db.base import Base
from app.db.models import RagChunk, RagQueryAudit, RagSource, User
from app.main import create_app
from app.modules.assistant.ingest import clean_text, parse_page_date
from app.modules.assistant.policy import SourcePolicy
from app.modules.assistant.router import get_assistant_service
from app.modules.assistant.service import RagAssistantService, cosine_similarity


class FakeEmbeddings:
    def embed_query(self, _text: str) -> list[float]:
        return [1.0, 0.0]


class FakeChat:
    def answer(self, *, question: str, context: str) -> str:
        assert question == "Where is CUET?"
        assert "Raozan" in context
        return "CUET is in Raozan, Chattogram."


class FailingChat:
    def answer(self, *, question: str, context: str) -> str:
        raise RuntimeError("private provider detail must not leave the API")


class FakeRouteService:
    def ask(self, user_id: str, question: str) -> dict:
        assert uuid.UUID(user_id)
        return {
            "answer": f"Grounded answer for: {question}",
            "status": "answered",
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


def test_text_preprocessing_dates_and_chunk_boundaries():
    raw = " CUET\u00a0Campus  \n\nCUET Campus\nEngineering   education "
    assert clean_text(raw) == "CUET Campus\nEngineering education"
    dated = BeautifulSoup(
        '<meta property="article:published_time" content="2026-09-28T10:30:00Z">',
        "html.parser",
    )
    assert parse_page_date(dated) == datetime(2026, 9, 28, 10, 30, tzinfo=UTC)
    assert parse_page_date(BeautifulSoup("<time>unknown</time>", "html.parser")) is None

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=80,
        chunk_overlap=15,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(" ".join(f"CUET-{index}" for index in range(60)))
    assert len(chunks) > 1
    assert all(0 < len(chunk) <= 80 for chunk in chunks)


def test_cosine_similarity_retrieval_helper():
    assert cosine_similarity([1.0, 0.0], [1.0, 0.0]) == pytest.approx(1.0)
    assert cosine_similarity([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)
    assert cosine_similarity([], []) == -1.0
    assert cosine_similarity([0.0, 0.0], [1.0, 0.0]) == -1.0


def test_grounded_retrieval_returns_answer_without_sources(assistant_stack):
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
    assert "sources" not in result
    assert "[1]" not in result["answer"]


def test_retrieval_ranks_the_relevant_cuet_chunk_first(assistant_stack):
    db, _, settings = assistant_stack
    relevant = RagSource(
        url="https://cuet.ac.bd/about",
        title="About CUET",
        content_type="text/html",
        content_hash="e" * 64,
        status="active",
        crawled_at=datetime.now(UTC),
        source_metadata={},
    )
    unrelated = RagSource(
        url="https://cuet.ac.bd/notice",
        title="Notices",
        content_type="text/html",
        content_hash="f" * 64,
        status="active",
        crawled_at=datetime.now(UTC),
        source_metadata={},
    )
    db.add_all([relevant, unrelated])
    db.flush()
    db.add_all(
        [
            RagChunk(
                source_id=relevant.id,
                chunk_index=0,
                content="CUET is situated in Raozan, Chattogram.",
                content_hash="1" * 64,
                embedding=[1.0, 0.0],
            ),
            RagChunk(
                source_id=unrelated.id,
                chunk_index=0,
                content="A general notice was published.",
                content_hash="2" * 64,
                embedding=[0.0, 1.0],
            ),
        ]
    )
    db.commit()

    matches = RagAssistantService(
        db, settings, embeddings=FakeEmbeddings(), chat=FakeChat()
    )._retrieve("Where is CUET?")

    assert matches[0].source.url == "https://cuet.ac.bd/about"
    assert matches[0].score == pytest.approx(1.0)


def test_empty_knowledge_returns_not_found_without_model_call(assistant_stack):
    db, user, settings = assistant_stack
    service = RagAssistantService(db, settings)

    result = service.ask(str(user.id), "What is available?")

    assert result["status"] == "not-found"
    assert "sources" not in result


def test_external_model_failure_is_a_safe_service_error(assistant_stack):
    db, user, settings = assistant_stack
    source = RagSource(
        url="https://cuet.ac.bd/about",
        title="About CUET",
        content_type="text/html",
        content_hash="c" * 64,
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
            content_hash="d" * 64,
            embedding=[1.0, 0.0],
        )
    )
    db.commit()
    service = RagAssistantService(
        db, settings, embeddings=FakeEmbeddings(), chat=FailingChat()
    )

    with pytest.raises(AppError) as caught:
        service.ask(str(user.id), "Where is CUET?")

    assert caught.value.status_code == 503
    assert "private provider detail" not in caught.value.message
    audit = db.scalar(select(RagQueryAudit).where(RagQueryAudit.user_id == user.id))
    assert audit is not None and audit.status == "failed"


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
