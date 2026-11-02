"""Supplied TSC/faculty evidence and entity-aware retrieval, without network calls."""

import uuid
from datetime import UTC, date, datetime

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.db.base import Base
from app.db.models import RagChunk, RagSource, User
from app.modules.assistant.curated import (
    CURATED_PREFIX,
    KNOWLEDGE_FILE,
    PIPELINE_VERSION,
    ingest_curated,
    load_attachment_sources,
    load_knowledge,
    plain_text,
)
from app.modules.assistant.service import (
    RagAssistantService,
    matches_retrieval_alias,
)


class OrthogonalEmbeddings:
    def embed_documents(self, texts):
        return [[0.0, 1.0] for _ in texts]

    def embed_query(self, text):
        return [1.0, 0.0]


@pytest.fixture
def attachment_stack(settings, monkeypatch):
    monkeypatch.setattr(
        "app.modules.assistant.curated.knowledge_today", lambda: date(2026, 11, 2)
    )
    monkeypatch.setattr(
        "app.modules.assistant.service.knowledge_today", lambda: date(2026, 11, 2)
    )
    engine = create_engine("sqlite+pysqlite://")
    Base.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as db:
        user = User(
            id=uuid.uuid4(),
            username="attachment.student",
            email="attachment@student.cuet.ac.bd",
            password_hash="test",
            role="student",
            university_id="attachment-001",
            first_name="Test",
            last_name="Student",
            home_address="CUET",
            verified_at=datetime.now(UTC),
            is_active=True,
        )
        db.add(user)
        db.commit()
        settings = settings.model_copy(update={"rag_knowledge_mode": "curated"})
        provider = OrthogonalEmbeddings()
        ingest_curated(db, settings, embedder=provider)
        yield db, user, settings, provider
    engine.dispose()


def test_all_supplied_faculty_appointments_are_preserved_without_double_counting():
    sections = load_knowledge().sections
    people = [item for item in sections if item.kind == "faculty-person"]
    departments = [item for item in sections if item.kind == "faculty-department"]
    assert len(people) == 354
    assert len(departments) == 17
    assert (
        sum(line.startswith("- ") for item in people for line in item.text.splitlines())
        == 360
    )
    assert all(item.aliases and item.locator for item in people)
    nur = next(item for item in people if "nur.mohammad@cuet.ac.bd" in item.text)
    assert "Electrical and Electronic Engineering (EEE): Professor" in nur.text
    assert "Nuclear Engineering (NE): Department Head" in nur.text
    assert "Sheet1!A47:D47" in nur.locator and "Sheet1!A357:D357" in nur.locator
    cse = next(item for item in departments if item.key == "faculty-department-cse")
    assert "39 faculty appointment rows" in cse.text
    assert "Dr. Pranab Kumar Dhar" in cse.text
    assert "Mir. Md. Saki Kowsar" in cse.text
    overview = next(item for item in sections if item.key == "faculty-workbook-scope")
    assert "360 department-appointment rows" in overview.text
    assert "354 distinct email" in overview.text
    assert "does not include DEM" in overview.text
    assert "not an independently verified current" in overview.text


def test_tsc_notes_preserve_services_floors_and_important_unknowns():
    topics = {item.key: item for item in load_knowledge().sections}
    services, floors = topics["tsc-services"], topics["tsc-floors"]
    for fact in (
        "Pubali Bank",
        "Rupali store",
        "bKash",
        "Nagad",
        "printing",
        "two grocery",
    ):
        assert fact in services.text
    assert "Ground floor: the cafeteria for students" in floors.text
    assert "Second floor: the cafeteria for teachers" in floors.text
    assert "head office of the Directorate of Students' Welfare" in floors.text
    assert "Third floor: space for club programs" in floors.text
    assert "Muslim female students" in floors.text
    assert "do not renumber" in floors.text
    assert services.evidence_type == floors.evidence_type == "user-supplied-snapshot"
    assert "opening hours" in services.text


def test_attachment_provenance_is_bundled_and_not_a_fake_official_url(attachment_stack):
    db, _, _, _ = attachment_stack
    registry = load_attachment_sources()
    assert registry["faculty-workbook"]["sha256"] == (
        "fb6c790be27d906cde0a530e347c0affa9877f6d68dde36d8a6d1e59bdf497f8"
    )
    assert all(item["independentlyVerified"] is False for item in registry.values())
    source = db.scalar(
        select(RagSource).where(RagSource.url == CURATED_PREFIX + "tsc-services")
    )
    metadata = source.source_metadata
    assert metadata["pipelineVersion"] == PIPELINE_VERSION
    assert metadata["evidenceUrls"] == []
    assert metadata["attachmentSources"][0]["filename"] == "TSC.txt"
    assert metadata["evidenceType"] == "user-supplied-snapshot"
    assert metadata["sourceLocator"] == "TSC.txt, paragraph 1"
    assert "D:\\" not in str(metadata)


@pytest.mark.parametrize(
    ("question", "expected"),
    [
        ("What is Kaushik Deb's email and designation?", "debkaushik99@cuet.ac.bd"),
        (
            "Who uses NUR.MOHAMMAD@CUET.AC.BD?",
            "Nuclear Engineering (NE): Department Head",
        ),
        ("Who is the head of BME in the faculty list?", "Dr. Nipu Kumar Das"),
        ("How many teachers are listed for CSE?", "39 faculty appointment rows"),
        ("Where is the DSW office?", "Second floor"),
        ("Can I print reports at TSC?", "printing shop"),
        ("Where can female students pray in TSC?", "Third floor"),
    ],
)
def test_exact_grounded_cues_retrieve_even_when_semantic_scores_are_low(
    attachment_stack, question, expected
):
    db, user, settings, provider = attachment_stack

    class GroundedChat:
        def answer(self, *, question, context):
            assert expected in context
            assert "User-supplied undated snapshot" in context
            assert "attachment://" not in context
            assert "CUET Faculty DeptNameEmailDesignation" not in context
            assert "D:\\" not in context
            return "Supplied information: " + expected

    service = RagAssistantService(
        db, settings, embeddings=provider, chat=GroundedChat()
    )
    matches = service._retrieve(question)
    assert matches[0].alias_match
    assert matches[0].score == pytest.approx(0.0)
    result = service.ask(str(user.id), question)
    assert result["status"] == "answered" and expected in result["answer"]
    assert set(result) == {"answer", "status"}


def test_faculty_records_do_not_split_names_from_their_contact_or_other_roles(
    attachment_stack,
):
    db, _, settings, provider = attachment_stack
    settings = settings.model_copy(
        update={"rag_chunk_size": 300, "rag_chunk_overlap": 30}
    )
    ingest_curated(db, settings, embedder=provider, force=True)
    for source in db.scalars(select(RagSource)):
        if source.source_metadata["sectionKind"] == "faculty-person":
            assert len(source.chunks) == 1
            assert "Contact email as supplied:" in source.chunks[0].content
            assert "Departmental appointment" in source.chunks[0].content


def test_generic_or_unrelated_queries_still_cannot_bypass_the_relevance_gate(
    attachment_stack,
):
    db, user, settings, provider = attachment_stack

    class NoChat:
        def answer(self, **kwargs):
            pytest.fail("Unrelated questions must not call the LLM")

    service = RagAssistantService(db, settings, embeddings=provider, chat=NoChat())
    assert (
        service.ask(str(user.id), "Who will win the FIFA World Cup?")["status"]
        == "not-found"
    )
    assert not matches_retrieval_alias("CUET", ["CUET"])
    assert not matches_retrieval_alias("faculty", ["CSE faculty"])
    assert not matches_retrieval_alias(
        "notnur.mohammad@cuet.ac.bd", ["nur.mohammad@cuet.ac.bd"]
    )
    assert matches_retrieval_alias(
        "Find NUR.MOHAMMAD@CUET.AC.BD.", ["nur.mohammad@cuet.ac.bd"]
    )
    assert not matches_retrieval_alias(
        "nur.mohammad@cuet.ac.bd.evil.example", ["nur.mohammad@cuet.ac.bd"]
    )


def test_entity_aliases_cannot_reintroduce_ineligible_sources(attachment_stack):
    db, _, settings, provider = attachment_stack
    for source in db.scalars(select(RagSource)):
        source.source_metadata = {**source.source_metadata, "pipelineVersion": -1}
    db.commit()
    with pytest.raises(AppError, match="not ready"):
        RagAssistantService(db, settings, embeddings=provider)._retrieve(
            "Kaushik Deb email"
        )


def test_organizational_faculties_are_not_confused_with_teacher_rosters(
    attachment_stack,
):
    db, _, settings, provider = attachment_stack
    matches = RagAssistantService(db, settings, embeddings=provider)._retrieve(
        "How many academic faculties does CUET have?"
    )
    assert matches[0].alias_match
    assert matches[0].source.source_metadata["section"] == "faculties"
    assert "CUET's five faculties" in matches[0].chunk.content


@pytest.mark.parametrize(
    "reference",
    ["attachment://unknown", "attachment://tsc-notes/../../.env", "file:///D:/TSC.txt"],
)
def test_only_registered_safe_attachment_references_are_accepted(tmp_path, reference):
    path = tmp_path / "knowledge.md"
    text = (
        "# Test knowledge\n\n## source | Source\nReviewed: 2026-11-02\n"
        "Review after: 2026-12-02\nSources:\n- "
        + reference
        + "\n\nFacts:\nExample campus fact.\n"
    )
    path.write_text(text, encoding="utf-8")
    path.with_suffix(".txt").write_text(plain_text(text), encoding="utf-8")
    with pytest.raises(ValueError):
        load_knowledge(path)


def test_registered_attachment_loading_never_fetches_the_reference(monkeypatch):
    def no_network(*args, **kwargs):
        pytest.fail("Bundled evidence references must never be fetched")

    monkeypatch.setattr("requests.get", no_network)
    assert len(load_knowledge().sections) == 390
    assert KNOWLEDGE_FILE.with_suffix(".txt").read_text(encoding="utf-8") == plain_text(
        KNOWLEDGE_FILE.read_text(encoding="utf-8")
    )


@pytest.mark.parametrize("failure", ["provider", "dimension"])
def test_embedding_batches_are_bounded_and_late_failures_preserve_the_index(
    attachment_stack, failure
):
    db, _, settings, _ = attachment_stack
    before = list(db.scalars(select(RagChunk.id).order_by(RagChunk.id)))

    class FailsInSecondBatch:
        calls = 0

        def embed_documents(self, texts):
            self.calls += 1
            assert 1 <= len(texts) <= 16
            if self.calls == 2:
                if failure == "provider":
                    raise RuntimeError("Embedding provider unavailable")
                return [[1.0, 0.0, 0.0] for _ in texts]
            return [[1.0, 0.0] for _ in texts]

    with pytest.raises((RuntimeError, ValueError)):
        ingest_curated(db, settings, embedder=FailsInSecondBatch(), force=True)
    assert list(db.scalars(select(RagChunk.id).order_by(RagChunk.id))) == before
