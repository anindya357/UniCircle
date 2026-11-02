"""Reviewed local CUET documents; no crawling or network access when loading."""

import hashlib
import json
import logging
import math
import re
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Protocol
from urllib.parse import urlsplit

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import RagChunk, RagSource
from app.modules.assistant.embeddings import (
    EMBEDDING_BATCH_SIZE,
    create_embedding_provider,
)

logger = logging.getLogger(__name__)

KNOWLEDGE_FILE = Path(__file__).with_name("knowledge") / "CUET_Knowledge_Base.md"
ATTACHMENT_MANIFEST = KNOWLEDGE_FILE.with_name("attachment_sources.json")
CURATED_PREFIX = "unicircle://cuet/curated/v1/"
PIPELINE_VERSION = 2


def curated_source_prefix(settings: Settings) -> str:
    # Keep cloud vectors separate so local Ollama retrieval remains usable.
    if settings.rag_embedding_provider == "fastembed":
        return CURATED_PREFIX + "fastembed-bge-small-en-v1.5/"
    return CURATED_PREFIX


def knowledge_today() -> date:
    """Review dates use Bangladesh time (UTC+6), including midnight boundaries."""
    return (datetime.now(UTC) + timedelta(hours=6)).date()


@dataclass(frozen=True)
class KnowledgeSection:
    key: str
    title: str
    reviewed: date
    review_after: date
    sources: tuple[str, ...]
    text: str
    kind: str = "general"
    aliases: tuple[str, ...] = ()
    locator: str | None = None

    @property
    def evidence_type(self) -> str:
        return (
            "user-supplied-snapshot"
            if any(source.startswith("attachment://") for source in self.sources)
            else "reviewed-public-summary"
        )


@dataclass(frozen=True)
class KnowledgeSnapshot:
    digest: str
    sections: tuple[KnowledgeSection, ...]


class DocumentEmbedder(Protocol):
    def embed_documents(self, texts: list[str]) -> list[list[float]]: ...


def plain_text(markdown: str) -> str:
    """Deterministic TXT mirror; headings lose Markdown markers only."""
    return re.sub(r"(?m)^#{1,6} ", "", markdown).rstrip() + "\n"


def load_attachment_sources() -> dict[str, dict]:
    """Read a bundled provenance registry, never an attachment URL or local path."""
    manifest = json.loads(ATTACHMENT_MANIFEST.read_text(encoding="utf-8"))
    if not isinstance(manifest, dict):
        raise ValueError("Attachment provenance must be a registry object")
    for key, item in manifest.items():
        if not re.fullmatch(r"[a-z][a-z0-9-]*", key) or not isinstance(item, dict):
            raise ValueError("Invalid attachment provenance entry")
        filename = item.get("filename", "")
        if not filename or any(char in filename for char in "/\\:\r\n"):
            raise ValueError("Attachment provenance must not contain local paths")
        if not re.fullmatch(r"[a-f0-9]{64}", item.get("sha256", "")):
            raise ValueError("Attachment provenance needs a SHA-256 fingerprint")
        date.fromisoformat(item["importedAt"])
        if item.get("independentlyVerified") is not False:
            raise ValueError("Supplied attachments must retain snapshot uncertainty")
    return manifest


def load_knowledge(path: Path = KNOWLEDGE_FILE) -> KnowledgeSnapshot:
    markdown = path.read_text(encoding="utf-8")
    companion = path.with_suffix(".txt")
    if companion.read_text(encoding="utf-8") != plain_text(markdown):
        raise ValueError("CUET Markdown and TXT knowledge files are out of sync")
    sections: list[KnowledgeSection] = []
    seen: set[str] = set()
    attachment_sources: dict[str, dict] = {}
    for block in re.split(r"(?m)^## ", markdown)[1:]:
        header, body = block.split("\n", 1)
        key, title = header.split(" | ", 1)
        if not re.fullmatch(r"[a-z][a-z0-9-]*", key) or key in seen:
            raise ValueError("Knowledge section IDs must be unique stable slugs")
        seen.add(key)
        metadata, facts = body.split("\nFacts:\n", 1)
        dates = re.search(
            r"Reviewed: (\d{4}-\d{2}-\d{2})\n"
            r"Review after: (\d{4}-\d{2}-\d{2})\n",
            metadata,
        )
        if dates is None:
            raise ValueError(f"Missing review dates for {key}")
        reviewed, review_after = (date.fromisoformat(value) for value in dates.groups())
        urls = tuple(re.findall(r"(?m)^- (\S+)$", metadata))
        if not urls or not facts.strip() or review_after < reviewed:
            raise ValueError(f"Invalid evidence, content or review dates for {key}")
        for url in urls:
            parts = urlsplit(url)
            if parts.scheme == "attachment":
                if not attachment_sources:
                    attachment_sources = load_attachment_sources()
                if (
                    parts.netloc not in attachment_sources
                    or parts.path
                    or parts.query
                    or parts.fragment
                ):
                    raise ValueError(
                        f"Unknown or unsafe attachment reference for {key}"
                    )
            elif (
                parts.scheme != "https"
                or not parts.hostname
                or parts.username
                or parts.password
            ):
                raise ValueError(f"Invalid public evidence URL for {key}")
        kind_match = re.search(r"(?m)^Kind: ([a-z-]+)$", metadata)
        kind = kind_match.group(1) if kind_match else "general"
        if kind not in {
            "general",
            "campus-service",
            "faculty-person",
            "faculty-department",
            "faculty-overview",
        }:
            raise ValueError(f"Invalid section kind for {key}")
        aliases_match = re.search(r"(?m)^Aliases: (.+)$", metadata)
        aliases = (
            tuple(
                dict.fromkeys(
                    part.strip() for part in aliases_match.group(1).split(";")
                )
            )
            if aliases_match
            else ()
        )
        if len(aliases) > 30 or any(not value or len(value) > 160 for value in aliases):
            raise ValueError(f"Invalid retrieval aliases for {key}")
        locator_match = re.search(r"(?m)^Locator: (.+)$", metadata)
        locator = locator_match.group(1) if locator_match else None
        if locator is not None and len(locator) > 300:
            raise ValueError(f"Invalid source locator for {key}")
        if kind == "faculty-person" and len(facts.strip()) > 4000:
            raise ValueError(f"Faculty contact record is too large for {key}")
        sections.append(
            KnowledgeSection(
                key,
                title,
                reviewed,
                review_after,
                urls,
                facts.strip(),
                kind,
                aliases,
                locator,
            )
        )
    if not sections:
        raise ValueError("CUET knowledge file has no reviewed sections")
    provenance = json.dumps(attachment_sources, sort_keys=True, ensure_ascii=True)
    digest = hashlib.sha256((markdown + "\n" + provenance).encode()).hexdigest()
    return KnowledgeSnapshot(digest, tuple(sections))


def source_is_eligible(
    source: RagSource,
    settings: Settings,
    snapshot: KnowledgeSnapshot | None,
    *,
    today: date | None = None,
) -> bool:
    metadata = source.source_metadata or {}
    if metadata.get("embeddingModel") != settings.assistant_embedding_model:
        return False
    if settings.rag_knowledge_mode == "web":
        return not source.url.startswith(CURATED_PREFIX)
    if snapshot is None or metadata.get("corpusHash") != snapshot.digest:
        return False
    section = next(
        (
            item
            for item in snapshot.sections
            if source.url == curated_source_prefix(settings) + item.key
        ),
        None,
    )
    return bool(
        section
        and metadata.get("pipelineVersion") == PIPELINE_VERSION
        and section.reviewed <= (today or knowledge_today()) <= section.review_after
    )


def ingest_curated(
    db: Session,
    settings: Settings,
    *,
    embedder: DocumentEmbedder | None = None,
    force: bool = False,
    path: Path = KNOWLEDGE_FILE,
) -> dict[str, int]:
    """Prepare every embedding before atomically replacing the curated snapshot."""
    snapshot = load_knowledge(path)
    attachments = (
        load_attachment_sources()
        if any(
            section.evidence_type == "user-supplied-snapshot"
            for section in snapshot.sections
        )
        else {}
    )
    prefix = curated_source_prefix(settings)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.rag_chunk_size,
        chunk_overlap=settings.rag_chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    existing = {
        source.url: source
        for source in db.scalars(
            select(RagSource).where(RagSource.url.startswith(prefix))
        )
    }
    prepared = []
    documents: list[str] = []
    now = datetime.now(UTC)
    for section in snapshot.sections:
        source = existing.get(prefix + section.key)
        # Repeated headings preserve topic context even in long split sections.
        # A faculty record is atomic: never detach a name from its contact or roles.
        parts = (
            [section.text]
            if section.kind == "faculty-person"
            else splitter.split_text(section.text)
        )
        evidence = (
            "User-supplied undated snapshot; not independently verified. "
            "Review date is the import/check date, not the source's effective date."
            if section.evidence_type == "user-supplied-snapshot"
            else "Reviewed public-source summary."
        )
        chunks = [
            f"{section.title}\nReviewed as of {section.reviewed.isoformat()}.\n"
            f"Evidence: {evidence}\n{part}"
            for part in parts
        ]
        digest = hashlib.sha256("\n\n".join(chunks).encode()).hexdigest()
        unchanged = bool(
            source
            and source.content_hash == digest
            and source.source_metadata.get("embeddingModel")
            == settings.assistant_embedding_model
            and source.source_metadata.get("pipelineVersion") == PIPELINE_VERSION
            and source.chunks
            and not force
        )
        start = len(documents)
        if not unchanged:
            documents.extend(chunks)
        prepared.append((section, source, chunks, digest, unchanged, start))
    vectors: list[list[float]] = []
    if documents:
        if embedder is None:
            embedder = create_embedding_provider(settings)
        dimension = None
        for offset in range(0, len(documents), EMBEDDING_BATCH_SIZE):
            batch = documents[offset : offset + EMBEDDING_BATCH_SIZE]
            batch_vectors = embedder.embed_documents(batch)
            if len(batch_vectors) != len(batch):
                raise ValueError(
                    "Embedding provider returned an unexpected vector count"
                )
            if dimension is None:
                dimension = len(batch_vectors[0])
            for vector in batch_vectors:
                if (
                    not dimension
                    or len(vector) != dimension
                    or not all(math.isfinite(value) for value in vector)
                    or not any(vector)
                ):
                    raise ValueError("Embedding provider returned an invalid vector")
            vectors.extend(batch_vectors)
            logger.info("Embedded %s/%s curated chunks", len(vectors), len(documents))
    result = {"processed": len(prepared), "updated": 0, "unchanged": 0, "chunks": 0}
    try:
        for section, source, chunks, digest, unchanged, start in prepared:
            if source is None:
                source = RagSource(url=prefix + section.key)
                db.add(source)
            source.title = section.title
            source.content_type = "text/markdown"
            source.content_hash = digest
            source.status = "unchanged" if unchanged else "active"
            source.published_at = datetime.combine(
                section.reviewed, datetime.min.time(), UTC
            )
            source.crawled_at = now
            source.error_message = None
            source.source_metadata = {
                "loader": "CuratedLocalKnowledge",
                "embeddingModel": settings.assistant_embedding_model,
                "corpusHash": snapshot.digest,
                "pipelineVersion": PIPELINE_VERSION,
                "reviewedAt": section.reviewed.isoformat(),
                "reviewAfter": section.review_after.isoformat(),
                "evidenceUrls": [
                    url for url in section.sources if url.startswith("https://")
                ],
                "attachmentSources": [
                    {"id": urlsplit(url).netloc, **attachments[urlsplit(url).netloc]}
                    for url in section.sources
                    if url.startswith("attachment://")
                ],
                "evidenceType": section.evidence_type,
                "sectionKind": section.kind,
                "retrievalAliases": list(section.aliases),
                "sourceLocator": section.locator,
                "section": section.key,
            }
            if not unchanged:
                db.flush()
                db.execute(delete(RagChunk).where(RagChunk.source_id == source.id))
                db.add_all(
                    RagChunk(
                        source_id=source.id,
                        chunk_index=index,
                        content=content,
                        content_hash=hashlib.sha256(content.encode()).hexdigest(),
                        embedding=vectors[start + index],
                    )
                    for index, content in enumerate(chunks)
                )
            result["unchanged" if unchanged else "updated"] += 1
            result["chunks"] += len(chunks)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return result
