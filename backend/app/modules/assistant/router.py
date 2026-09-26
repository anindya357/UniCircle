"""Authenticated assistant query and App Admin knowledge-status endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.schemas import ApiResponse
from app.core.auth import AuthIdentity, get_current_admin, get_current_user
from app.core.config import Settings, get_settings
from app.db.models import RagChunk, RagSource
from app.db.session import get_db
from app.modules.assistant.schemas import AssistantQuestion
from app.modules.assistant.service import RagAssistantService

router = APIRouter(tags=["campus-ai-assistant"])


def get_assistant_service(
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> RagAssistantService:
    return RagAssistantService(db, settings)


@router.post("/assistant/ask", response_model=ApiResponse[dict])
def ask_assistant(
    body: AssistantQuestion,
    user: Annotated[AuthIdentity, Depends(get_current_user)],
    service: Annotated[RagAssistantService, Depends(get_assistant_service)],
) -> ApiResponse[dict]:
    return ApiResponse(data=service.ask(user.id, body.question))


@router.get("/admin/assistant/knowledge", response_model=ApiResponse[dict])
def knowledge_status(
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[AuthIdentity, Depends(get_current_admin)],
) -> ApiResponse[dict]:
    source_count = db.scalar(select(func.count()).select_from(RagSource)) or 0
    active_count = (
        db.scalar(
            select(func.count())
            .select_from(RagSource)
            .where(RagSource.status.in_(("active", "unchanged")))
        )
        or 0
    )
    chunk_count = db.scalar(select(func.count()).select_from(RagChunk)) or 0
    latest = db.scalar(select(func.max(RagSource.crawled_at)))
    return ApiResponse(
        data={
            "sourceCount": source_count,
            "activeSourceCount": active_count,
            "chunkCount": chunk_count,
            "lastCrawledAt": latest.isoformat() if latest else None,
        }
    )
