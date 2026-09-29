"""Database relationships, constraints, rollback, indexes, and race safeguards."""

import threading
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
from sqlalchemy import create_engine, event, inspect, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import (
    Club,
    ClubAdmin,
    ClubEvent,
    EventRegistration,
    Notification,
    User,
)


def student(label: str) -> User:
    return User(
        id=uuid.uuid4(),
        username=f"{label}.student",
        email=f"{label}@student.cuet.ac.bd",
        password_hash="argon2-test-hash",
        role="student",
        university_id=f"u-{label}",
        first_name=label.title(),
        last_name="Student",
        home_address="CUET",
        verified_at=datetime.now(UTC),
        is_active=True,
    )


def club(identifier: str) -> Club:
    return Club(
        id=identifier,
        name=f"{identifier.title()} Club",
        short_name=identifier.upper(),
        category="Academic",
        tagline="Student community",
        description="A CUET student club.",
        activities=["Workshop"],
        membership_fee=200,
    )


@pytest.fixture
def integrity_engine():
    database_path = Path(__file__).parent / f".phase9-{uuid.uuid4().hex}.db"
    engine = create_engine(
        f"sqlite+pysqlite:///{database_path.as_posix()}",
        connect_args={"check_same_thread": False, "timeout": 10},
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _record):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()
    database_path.unlink(missing_ok=True)


def test_club_admin_many_to_many_and_cascade(integrity_engine):
    with Session(integrity_engine) as db:
        first, second = student("alpha"), student("beta")
        robotics, debate = club("robotics"), club("debate")
        db.add_all([first, second, robotics, debate])
        db.flush()
        db.add_all(
            [
                ClubAdmin(club_id=robotics.id, user_id=first.id),
                ClubAdmin(club_id=robotics.id, user_id=second.id),
                ClubAdmin(club_id=debate.id, user_id=first.id),
            ]
        )
        db.commit()
        assert len(db.scalars(select(ClubAdmin)).all()) == 3

        db.delete(robotics)
        db.commit()
        remaining = db.scalars(select(ClubAdmin)).all()
        assert [(item.club_id, item.user_id) for item in remaining] == [
            (debate.id, first.id)
        ]


def test_foreign_keys_unique_constraints_and_rollback(integrity_engine):
    with Session(integrity_engine) as db:
        owner = student("owner")
        db.add(owner)
        db.commit()
        db.add(ClubAdmin(club_id="missing-club", user_id=owner.id))
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
        assert db.scalar(select(ClubAdmin)) is None

        db.add_all([club("science"), club("science")])
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
        assert db.scalar(select(Club).where(Club.id == "science")) is None


def test_duplicate_registration_race_keeps_one_row(integrity_engine):
    with Session(integrity_engine) as db:
        attendee = student("race")
        item = club("computer")
        starts = datetime.now(UTC) + timedelta(days=2)
        event_item = ClubEvent(
            club_id=item.id,
            title="Programming contest",
            category="Contest",
            summary="A campus programming contest.",
            location="CUET",
            starts_at=starts,
            ends_at=starts + timedelta(hours=2),
            registration_enabled=True,
            is_paid=False,
            fee=0,
        )
        db.add_all([attendee, item, event_item])
        db.commit()
        user_id, event_id = attendee.id, event_item.id

    barrier = threading.Barrier(2)
    outcomes: list[str] = []
    lock = threading.Lock()

    def register() -> None:
        with Session(integrity_engine) as db:
            db.add(
                EventRegistration(
                    event_id=event_id,
                    user_id=user_id,
                    participant_name="Race Student",
                    email="race@student.cuet.ac.bd",
                    student_id="u-race",
                    department_name="CSE",
                    payment_status="not_required",
                )
            )
            barrier.wait()
            try:
                db.commit()
                result = "created"
            except IntegrityError:
                db.rollback()
                result = "duplicate"
            with lock:
                outcomes.append(result)

    threads = [threading.Thread(target=register) for _ in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=15)

    assert sorted(outcomes) == ["created", "duplicate"]
    with Session(integrity_engine) as db:
        assert len(db.scalars(select(EventRegistration)).all()) == 1


def test_important_query_indexes_are_present(integrity_engine):
    database = inspect(integrity_engine)
    notification_indexes = {
        item["name"] for item in database.get_indexes(Notification.__tablename__)
    }
    registration_uniques = {
        tuple(item["column_names"])
        for item in database.get_unique_constraints(EventRegistration.__tablename__)
    }
    assert "ix_notifications_recipient_created" in notification_indexes
    assert ("event_id", "user_id") in registration_uniques
