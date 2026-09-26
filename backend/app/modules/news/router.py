"""Campus news reads and App Admin publishing endpoints."""

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.schemas import ApiResponse
from app.core.auth import AuthIdentity, get_current_admin, get_current_user
from app.core.errors import AppError
from app.db.models import CampusNewsItem, CampusNewsNotification, User
from app.db.session import get_db
from app.modules.news.schemas import NewsItemIn, PublishStatusIn

router = APIRouter(tags=["campus-news"])
Db = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[AuthIdentity, Depends(get_current_user)]
CurrentAdmin = Annotated[AuthIdentity, Depends(get_current_admin)]
NOTIFY_KINDS = {"update", "announcement"}


def fail(status_code: int, code: str, message: str) -> None:
    raise AppError(status_code=status_code, code=code, message=message)


def author_name(db: Session, item: CampusNewsItem) -> str:
    author = db.get(User, item.author_id)
    if author is None:
        return "UniCircle Administration"
    return author.admin_id or "UniCircle Administration"


def public_data(db: Session, item: CampusNewsItem) -> dict:
    if item.published_at is None:
        raise RuntimeError("Published campus information is missing its timestamp")
    return {
        "id": str(item.id),
        "type": item.kind,
        "title": item.title,
        "summary": item.summary,
        "content": item.content,
        "publishedAt": item.published_at.isoformat(),
        "publishedBy": author_name(db, item),
        "audience": item.audience,
    }


def admin_data(db: Session, item: CampusNewsItem) -> dict:
    return {
        "id": str(item.id),
        "type": item.kind,
        "title": item.title,
        "summary": item.summary,
        "content": item.content,
        "audience": item.audience,
        "status": item.status,
        "publishedAt": item.published_at.isoformat() if item.published_at else None,
        "publishedBy": author_name(db, item),
        "updatedAt": item.updated_at.isoformat(),
    }


def get_item(db: Session, item_id: uuid.UUID) -> CampusNewsItem:
    item = db.get(CampusNewsItem, item_id)
    if item is None:
        fail(404, "news_item_not_found", "Campus information item not found.")
    return item


def sync_notifications(db: Session, item: CampusNewsItem) -> None:
    should_notify = item.status == "published" and item.kind in NOTIFY_KINDS
    if not should_notify:
        db.execute(
            delete(CampusNewsNotification).where(
                CampusNewsNotification.news_item_id == item.id
            )
        )
        return
    recipients = set(
        db.scalars(
            select(User.id).where(
                User.role != "admin",
                User.is_active.is_(True),
                User.verified_at.is_not(None),
            )
        ).all()
    )
    existing = set(
        db.scalars(
            select(CampusNewsNotification.user_id).where(
                CampusNewsNotification.news_item_id == item.id
            )
        ).all()
    )
    for user_id in recipients - existing:
        db.add(CampusNewsNotification(news_item_id=item.id, user_id=user_id))


def apply_input(item: CampusNewsItem, body: NewsItemIn) -> None:
    item.kind = body.type
    item.title = body.title
    item.summary = body.summary
    item.content = body.content
    item.audience = body.audience
    item.status = body.status
    if body.status == "published" and item.published_at is None:
        item.published_at = datetime.now(UTC)
    if body.status == "draft":
        item.published_at = None


@router.get("/news", response_model=ApiResponse[list[dict]])
def list_published_news(
    db: Db,
    _user: CurrentUser,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ApiResponse[list[dict]]:
    items = db.scalars(
        select(CampusNewsItem)
        .where(CampusNewsItem.status == "published")
        .order_by(CampusNewsItem.published_at.desc(), CampusNewsItem.id.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return ApiResponse(data=[public_data(db, item) for item in items])


@router.get("/news/{item_id}", response_model=ApiResponse[dict])
def get_published_news(
    item_id: uuid.UUID, db: Db, _user: CurrentUser
) -> ApiResponse[dict]:
    item = get_item(db, item_id)
    if item.status != "published":
        fail(404, "news_item_not_found", "Campus information item not found.")
    return ApiResponse(data=public_data(db, item))


@router.get("/admin/news", response_model=ApiResponse[list[dict]])
def list_admin_news(db: Db, _admin: CurrentAdmin) -> ApiResponse[list[dict]]:
    items = db.scalars(
        select(CampusNewsItem).order_by(
            CampusNewsItem.updated_at.desc(), CampusNewsItem.id.desc()
        )
    ).all()
    return ApiResponse(data=[admin_data(db, item) for item in items])


@router.post(
    "/admin/news", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED
)
def create_news_item(
    body: NewsItemIn, db: Db, admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = CampusNewsItem(author_id=uuid.UUID(admin.id))
    apply_input(item, body)
    db.add(item)
    db.flush()
    sync_notifications(db, item)
    db.commit()
    db.refresh(item)
    return ApiResponse(data=admin_data(db, item))


@router.put("/admin/news/{item_id}", response_model=ApiResponse[dict])
def update_news_item(
    item_id: uuid.UUID, body: NewsItemIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = get_item(db, item_id)
    apply_input(item, body)
    sync_notifications(db, item)
    db.commit()
    db.refresh(item)
    return ApiResponse(data=admin_data(db, item))


@router.put("/admin/news/{item_id}/status", response_model=ApiResponse[dict])
def set_news_status(
    item_id: uuid.UUID, body: PublishStatusIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = get_item(db, item_id)
    item.status = body.status
    if body.status == "published" and item.published_at is None:
        item.published_at = datetime.now(UTC)
    if body.status == "draft":
        item.published_at = None
    sync_notifications(db, item)
    db.commit()
    db.refresh(item)
    return ApiResponse(data=admin_data(db, item))


@router.delete("/admin/news/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news_item(item_id: uuid.UUID, db: Db, _admin: CurrentAdmin) -> Response:
    db.delete(get_item(db, item_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
