"""Phase 7 identity tables imported by Alembic metadata discovery."""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('student', 'teacher', 'staff', 'admin')",
            name="valid_role",
        ),
        CheckConstraint(
            "(role = 'admin' AND admin_id IS NOT NULL AND username IS NULL "
            "AND email IS NULL AND university_id IS NULL) OR "
            "(role <> 'admin' AND admin_id IS NULL AND username IS NOT NULL "
            "AND email IS NOT NULL AND university_id IS NOT NULL "
            "AND first_name IS NOT NULL AND last_name IS NOT NULL "
            "AND home_address IS NOT NULL)",
            name="role_fields",
        ),
        UniqueConstraint("role", "university_id", name="uq_users_role_university_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str | None] = mapped_column(String(50))
    admin_id: Mapped[str | None] = mapped_column(String(128))
    email: Mapped[str | None] = mapped_column(String(254))
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    university_id: Mapped[str | None] = mapped_column(String(64))
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    home_address: Mapped[str | None] = mapped_column(String(500))
    department_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(40))
    bio: Mapped[str | None] = mapped_column(String(240))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )

    auth_sessions: Mapped[list["AuthSession"]] = relationship(back_populates="user")
    otp_challenges: Mapped[list["OtpChallengeRecord"]] = relationship(
        back_populates="user"
    )


Index("uq_users_username_lower", func.lower(User.username), unique=True)
Index("uq_users_admin_id_lower", func.lower(User.admin_id), unique=True)
Index("uq_users_email_lower", func.lower(User.email), unique=True)


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    jti_digest: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="auth_sessions")


class OtpChallengeRecord(Base):
    __tablename__ = "otp_challenges"
    __table_args__ = (
        UniqueConstraint("recipient_email", "purpose", name="uq_otp_recipient_purpose"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recipient_email: Mapped[str] = mapped_column(String(254), nullable=False)
    purpose: Mapped[str] = mapped_column(String(40), nullable=False)
    digest: Mapped[str] = mapped_column(String(64), nullable=False)
    attempts_remaining: Mapped[int] = mapped_column(Integer, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="otp_challenges")


class AuthRateLimit(Base):
    """Fixed-window limits keyed by a digest, never a raw identifier or IP."""

    __tablename__ = "auth_rate_limits"
    __table_args__ = (
        UniqueConstraint("scope", "key_digest", name="uq_auth_limit_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scope: Mapped[str] = mapped_column(String(40), nullable=False)
    key_digest: Mapped[str] = mapped_column(String(64), nullable=False)
    window_started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False)
