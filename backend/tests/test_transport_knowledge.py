"""Transport evidence reaches the assistant without inventing times or contacts."""

import uuid
from dataclasses import replace
from datetime import UTC, date, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.auth import AuthIdentity, get_current_user
from app.db.base import Base
from app.db.models import RagSource, User
from app.main import create_app
from app.modules.assistant.curated import (
    CURATED_PREFIX,
    KNOWLEDGE_FILE,
    KnowledgeSnapshot,
    ingest_curated,
    load_attachment_sources,
    load_knowledge,
    plain_text,
    source_is_eligible,
)
from app.modules.assistant.router import get_assistant_service
from app.modules.assistant.service import RagAssistantService
from app.modules.transport.seed import BUSES, DRIVERS


class OrthogonalEmbeddings:
    def embed_documents(self, texts):
        return [[0.0, 1.0] for _ in texts]

    def embed_query(self, _text):
        return [1.0, 0.0]


@pytest.fixture
def transport_knowledge(settings, monkeypatch):
    for module in ("curated", "service", "router"):
        monkeypatch.setattr(
            f"app.modules.assistant.{module}.knowledge_today",
            lambda: date(2026, 11, 16),
        )
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    settings = settings.model_copy(update={"rag_knowledge_mode": "curated"})
    with Session(engine, expire_on_commit=False) as db:
        user = User(
            id=uuid.uuid4(),
            username="transport.knowledge.student",
            email="transport.knowledge@student.cuet.ac.bd",
            password_hash="test",
            role="student",
            university_id="transport-kb-001",
            first_name="Transport",
            last_name="Student",
            home_address="CUET",
            verified_at=datetime.now(UTC),
            is_active=True,
        )
        db.add(user)
        db.commit()
        embeddings = OrthogonalEmbeddings()
        ingest_curated(db, settings, embedder=embeddings)
        yield db, user, settings, embeddings
    engine.dispose()


def test_transport_roster_preserves_supplied_drivers_fleet_and_source_provenance():
    sections = {section.key: section for section in load_knowledge().sections}
    records = [item for item in sections.values() if item.kind == "transport-driver"]
    assert len(records) == 25
    for row, name, phone, category in DRIVERS:
        item = sections[f"transport-driver-{row}"]
        assert name in item.text and phone in item.text
        assert len(phone) == 11 and phone.startswith("0")
        assert f"{category}-vehicle driver" in item.text
        assert item.evidence_type == "user-supplied-snapshot"
        assert phone in sections["transport-drivers"].text
    assert all(f"transport-driver-{row}" not in sections for row in range(1, 7))
    assert all(name in sections["transport-fleet"].text for _, name, _ in BUSES)
    manifest = load_attachment_sources()
    assert manifest["transport-driver-roster"]["filename"] == "6829717dae095.pdf"
    assert manifest["transport-driver-roster"]["sha256"] == (
        "50f6820e4aed06c8b576843a171931b6f5cfb39d9f8c6a120f443721d459b9ca"
    )
    assert manifest["transport-routine"]["sourceEffectiveDate"] is None


@pytest.mark.parametrize(
    ("question", "expected"),
    [
        (
            "When is the evening bus from CUET?",
            ("4:15 PM to 5:45 PM", "CUET to Bottoli Rail Station"),
        ),
        (
            "When is the night bus back to CUET?",
            ("8:30 PM to 10:00 PM", "Bottoli Rail Station to CUET"),
        ),
        ("When is the morning bus to CUET?", ("7:00 AM to 8:20 AM", "11 buses")),
        ("When is the midday bus?", ("1:30 PM to 3:00 PM", "4 buses")),
        ("How many total busses does CUET have?", ("20 active named buses", "BRTC-4")),
        (
            "How many drivers does CUET have?",
            ("25 driver contacts", "14 heavy-vehicle and 11 light-vehicle"),
        ),
        ("What is the phone number of Md. Khorshed Alam?", ("01672735883",)),
        ("Who drives Tista?", ("Md. Zahedul Islam", "01819542054")),
        (
            "Which CUET bus route goes through Chawkbazar?",
            ("Kotowali", "9 regular-route buses and 2 Chawkbazar-route"),
        ),
    ],
)
def test_transport_questions_are_grounded_even_below_the_semantic_threshold(
    transport_knowledge, question, expected
):
    db, user, settings, embeddings = transport_knowledge

    class GroundedChat:
        def answer(self, *, question, context):
            assert all(fact in context for fact in expected)
            assert "User-supplied undated snapshot" in context
            return " ".join(expected)

    service = RagAssistantService(
        db, settings, embeddings=embeddings, chat=GroundedChat()
    )
    result = service.ask(str(user.id), question)
    assert result == {"answer": " ".join(expected), "status": "answered"}


def test_complete_driver_contacts_fit_retrieved_roster_context(transport_knowledge):
    db, _, settings, embeddings = transport_knowledge
    matches = RagAssistantService(db, settings, embeddings=embeddings)._retrieve(
        "List all CUET bus drivers and their phone numbers"
    )
    context = "\n".join(item.chunk.content for item in matches if item.alias_match)
    assert all(name in context and phone in context for _, name, phone, _ in DRIVERS)


def test_contact_records_stay_atomic_at_the_smallest_chunk_size(transport_knowledge):
    db, _, settings, embeddings = transport_knowledge
    settings = settings.model_copy(
        update={"rag_chunk_size": 300, "rag_chunk_overlap": 30}
    )
    ingest_curated(db, settings, embedder=embeddings, force=True)
    for source in db.scalars(select(RagSource)):
        if source.source_metadata["sectionKind"] == "transport-driver":
            assert len(source.chunks) == 1
            assert "Driver name:" in source.chunks[0].content
            assert "Driver phone number:" in source.chunks[0].content
            assert "Assigned bus in UniCircle:" in source.chunks[0].content


def test_chatbox_example_succeeds_through_authenticated_assistant_api(
    transport_knowledge,
):
    db, user, settings, embeddings = transport_knowledge

    class EveningChat:
        def answer(self, *, question, context):
            assert question == "When is the evening bus from CUET?"
            assert "CUET to Bottoli Rail Station" in context
            assert "4:15 PM to 5:45 PM" in context
            return "The CUET-to-Bottoli bus runs from 4:15 PM to 5:45 PM."

    app = create_app(settings)
    app.dependency_overrides[get_current_user] = lambda: AuthIdentity(
        id=str(user.id), role="student", is_active=True, is_verified=True
    )
    app.dependency_overrides[get_assistant_service] = lambda: RagAssistantService(
        db, settings, embeddings=embeddings, chat=EveningChat()
    )
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/assistant/ask",
            json={"question": "When is the evening bus from CUET?"},
        )
    assert response.status_code == 200
    assert response.json()["data"] == {
        "answer": "The CUET-to-Bottoli bus runs from 4:15 PM to 5:45 PM.",
        "status": "answered",
    }


def test_unsupported_transport_details_do_not_trigger_generation(transport_knowledge):
    db, user, settings, embeddings = transport_knowledge

    class NoChat:
        def answer(self, **kwargs):
            pytest.fail("Unsupported details must not reach the chat provider")

    result = RagAssistantService(
        db, settings, embeddings=embeddings, chat=NoChat()
    ).ask(str(user.id), "What is Tista's engine number?")
    assert result["status"] == "not-found"


def test_incremental_index_keeps_previous_release_usable_and_rejects_changed_facts(
    transport_knowledge, tmp_path
):
    db, _, settings, embeddings = transport_knowledge
    original = load_knowledge()
    source = db.scalar(
        select(RagSource).where(RagSource.url == CURATED_PREFIX + "identity")
    )
    # Simulate the metadata produced before per-section fingerprints existed.
    source.source_metadata = {
        key: value
        for key, value in source.source_metadata.items()
        if key != "sectionHash"
    }
    db.commit()
    markdown = (
        KNOWLEDGE_FILE.read_text(encoding="utf-8")
        + """
## release-test | Release compatibility test
Reviewed: 2026-11-16
Review after: 2026-12-16
Sources:
- https://cuet.ac.bd/

Facts:
A new independently indexed section for this disposable test.
"""
    )
    path = tmp_path / "knowledge.md"
    path.write_text(markdown, encoding="utf-8")
    path.with_suffix(".txt").write_text(plain_text(markdown), encoding="utf-8")
    result = ingest_curated(db, settings, embedder=embeddings, path=path)
    updated = load_knowledge(path)
    assert result["updated"] == 1 and result["unchanged"] == len(original.sections)
    assert source.source_metadata["corpusHash"] == original.digest
    assert source_is_eligible(source, settings, original, today=date(2026, 11, 16))
    assert source_is_eligible(source, settings, updated, today=date(2026, 11, 16))
    changed_sections = tuple(
        replace(item, text="Changed facts require reindexing.")
        if item.key == "identity"
        else item
        for item in updated.sections
    )
    changed = KnowledgeSnapshot("0" * 64, changed_sections)
    assert not source_is_eligible(source, settings, changed, today=date(2026, 11, 16))
