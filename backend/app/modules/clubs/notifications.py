"""Idempotent event lifecycle job; run externally on a schedule."""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import ClubEvent, EventInterest, EventNotification, EventRegistration
from app.db.session import get_session_factory


def reconcile_event_notifications(db: Session, now: datetime | None = None) -> int:
    now = now or datetime.now(UTC)
    if now.tzinfo is None:
        raise ValueError("now must be timezone-aware")
    created = 0
    # A row lock serializes concurrent workers for each event on PostgreSQL.
    for event in db.scalars(
        select(ClubEvent).where(ClubEvent.starts_at <= now).with_for_update()
    ):
        kinds = ["started"]
        end = (
            event.ends_at.replace(tzinfo=UTC)
            if event.ends_at.tzinfo is None
            else event.ends_at
        )
        if end <= now:
            kinds.append("finished")
        recipients = set(
            db.scalars(
                select(EventInterest.user_id).where(EventInterest.event_id == event.id)
            )
        )
        recipients.update(
            db.scalars(
                select(EventRegistration.user_id).where(
                    EventRegistration.event_id == event.id
                )
            )
        )
        for recipient in recipients:
            for kind in kinds:
                exists = db.scalar(
                    select(EventNotification.id).where(
                        EventNotification.event_id == event.id,
                        EventNotification.user_id == recipient,
                        EventNotification.kind == kind,
                    )
                )
                if exists is None:
                    db.add(
                        EventNotification(
                            event_id=event.id, user_id=recipient, kind=kind
                        )
                    )
                    created += 1
    db.commit()
    return created


if __name__ == "__main__":
    with get_session_factory()() as session:
        count = reconcile_event_notifications(session)
    print(f"Created {count} new event notifications.")
