"""Phase 7 identity tables imported by Alembic metadata discovery."""

import uuid
from datetime import date, datetime, time

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
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


class Department(Base, TimestampMixin):
    """Academic department, sourced from CUET's public department pages."""

    __tablename__ = "departments"

    code: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    office_email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str | None] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String(500))
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    faculty: Mapped[list["FacultyDirectoryEntry"]] = relationship(
        back_populates="department", order_by="FacultyDirectoryEntry.sort_order"
    )


class FacultyDirectoryEntry(Base, TimestampMixin):
    """A faculty listing is department-specific; one person may appear twice."""

    __tablename__ = "faculty_directory_entries"
    __table_args__ = (
        UniqueConstraint(
            "department_code", "source_id", name="uq_faculty_department_source"
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    department_code: Mapped[str] = mapped_column(
        ForeignKey("departments.code", ondelete="CASCADE"), nullable=False, index=True
    )
    source_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    designation: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str | None] = mapped_column(String(100))
    office: Mapped[str | None] = mapped_column(String(100))
    profile_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    department: Mapped[Department] = relationship(back_populates="faculty")


class CampusLocation(Base, TimestampMixin):
    """A reviewed point of interest inside CUET's Raozan campus boundary."""

    __tablename__ = "campus_locations"
    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90 AND 90", name="valid_latitude"),
        CheckConstraint("longitude BETWEEN -180 AND 180", name="valid_longitude"),
        UniqueConstraint("osm_type", "osm_id", name="uq_campus_location_osm_ref"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(12), nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    osm_type: Mapped[str] = mapped_column(String(8), nullable=False)
    osm_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)


class Club(Base, TimestampMixin):
    __tablename__ = "clubs"
    __table_args__ = (
        CheckConstraint("membership_fee = 200", name="standard_membership_fee"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(40), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    tagline: Mapped[str] = mapped_column(String(240), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    activities: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    membership_recruitment_open: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    membership_fee: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="200"
    )
    membership_bkash_number: Mapped[str | None] = mapped_column(String(24))
    membership_nagad_number: Mapped[str | None] = mapped_column(String(24))


class ClubMember(Base):
    __tablename__ = "club_members"

    club_id: Mapped[str] = mapped_column(
        ForeignKey("clubs.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ClubAdmin(Base):
    __tablename__ = "club_admins"

    club_id: Mapped[str] = mapped_column(
        ForeignKey("clubs.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    appointed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ClubMembershipRequest(Base, TimestampMixin):
    __tablename__ = "club_membership_requests"
    __table_args__ = (
        UniqueConstraint("club_id", "user_id", name="uq_club_membership_request_user"),
        CheckConstraint("status IN ('pending','approved')", name="valid_status"),
        CheckConstraint(
            "payment_method IN ('bkash','nagad')", name="valid_payment_method"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    club_id: Mapped[str] = mapped_column(
        ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    applicant_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    department_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    motivation: Mapped[str] = mapped_column(Text, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(12), nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(100), nullable=False)
    fee: Mapped[int] = mapped_column(Integer, nullable=False, server_default="200")
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="pending"
    )
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ClubMembershipNotification(Base):
    __tablename__ = "club_membership_notifications"
    __table_args__ = (
        UniqueConstraint("membership_request_id", name="uq_membership_notification"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    membership_request_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("club_membership_requests.id", ondelete="CASCADE"), nullable=False
    )
    club_id: Mapped[str] = mapped_column(
        ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ClubCreationRequest(Base, TimestampMixin):
    __tablename__ = "club_creation_requests"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','approved','rejected')", name="valid_status"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    requester_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(40), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    tagline: Mapped[str] = mapped_column(String(240), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    activities: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="pending"
    )
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_note: Mapped[str | None] = mapped_column(Text)
    approved_club_id: Mapped[str | None] = mapped_column(
        ForeignKey("clubs.id"), unique=True
    )


class ClubEvent(Base, TimestampMixin):
    __tablename__ = "club_events"
    __table_args__ = (
        CheckConstraint("ends_at > starts_at", name="valid_time_range"),
        CheckConstraint("fee >= 0", name="valid_fee"),
        CheckConstraint(
            "(is_paid = false) OR (registration_enabled = true "
            "AND fee > 0 AND bkash_number IS NOT NULL)",
            name="valid_paid_setup",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    club_id: Mapped[str] = mapped_column(
        ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(250), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    ends_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    registration_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    registration_closes_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    is_paid: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    fee: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    bkash_number: Mapped[str | None] = mapped_column(String(24))


class EventInterest(Base):
    __tablename__ = "event_interests"
    __table_args__ = (
        CheckConstraint("status IN ('interested','going')", name="valid_status"),
    )

    event_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("club_events.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    status: Mapped[str] = mapped_column(String(16), nullable=False)


class EventRegistration(Base, TimestampMixin):
    __tablename__ = "event_registrations"
    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_registration_user"),
        CheckConstraint(
            "payment_status IN ('not_required','pending_review','verified','rejected')",
            name="valid_payment_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("club_events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    participant_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    department_name: Mapped[str] = mapped_column(String(100), nullable=False)
    bkash_trx_id: Mapped[str | None] = mapped_column(String(100))
    payment_status: Mapped[str] = mapped_column(String(20), nullable=False)


class EventNotification(Base):
    __tablename__ = "event_notifications"
    __table_args__ = (
        UniqueConstraint(
            "event_id", "user_id", "kind", name="uq_event_notification_state"
        ),
        CheckConstraint("kind IN ('started','finished')", name="valid_kind"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("club_events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ResourceProfile(Base, TimestampMixin):
    """Optional, opt-in public resource-discovery details for a General User."""

    __tablename__ = "resource_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    is_discoverable: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    level: Mapped[str | None] = mapped_column(String(60))
    hall: Mapped[str | None] = mapped_column(String(100))
    availability_note: Mapped[str | None] = mapped_column(String(500))


class ResourceProfileCategory(Base):
    __tablename__ = "resource_profile_categories"
    __table_args__ = (
        CheckConstraint(
            "category IN ('notebook','lab-report','t-scale','bicycle','other')",
            name="valid_category",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resource_profiles.user_id", ondelete="CASCADE"), primary_key=True
    )
    category: Mapped[str] = mapped_column(String(20), primary_key=True)


class ResourceRequest(Base, TimestampMixin):
    __tablename__ = "resource_requests"
    __table_args__ = (
        CheckConstraint("requester_id <> recipient_id", name="different_users"),
        CheckConstraint(
            "category IN ('notebook','lab-report','t-scale','bicycle','other')",
            name="valid_category",
        ),
        CheckConstraint(
            "status IN ('pending','accepted','rejected')", name="valid_status"
        ),
        Index("ix_resource_requests_recipient_status", "recipient_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    requester_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    recipient_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    resource_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="pending"
    )
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    resource_request_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resource_requests.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_conversation_time_id", "conversation_id", "sent_at", "id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ForumPost(Base, TimestampMixin):
    """A text-only community discussion visible until an Admin removes it."""

    __tablename__ = "forum_posts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    removed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    removed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )


class ForumComment(Base, TimestampMixin):
    """A text-only comment whose visibility follows its parent post."""

    __tablename__ = "forum_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)


class ForumReport(Base, TimestampMixin):
    """One moderation report per reporter and post."""

    __tablename__ = "forum_reports"
    __table_args__ = (
        UniqueConstraint("post_id", "reporter_id", name="uq_forum_report_user"),
        CheckConstraint(
            "status IN ('open','resolved','post-removed')", name="valid_status"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="open", index=True
    )
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CampusNewsItem(Base, TimestampMixin):
    """Admin-authored campus information with an explicit publication state."""

    __tablename__ = "campus_news_items"
    __table_args__ = (
        CheckConstraint("kind IN ('news','update','announcement')", name="valid_kind"),
        CheckConstraint("status IN ('draft','published')", name="valid_status"),
        Index("ix_campus_news_published", "status", "published_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    kind: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str] = mapped_column(String(600), nullable=False)
    content: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    audience: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="draft", index=True
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), index=True
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )


class CampusNewsNotification(Base):
    """A deduplicated announcement/update notification for one General User."""

    __tablename__ = "campus_news_notifications"
    __table_args__ = (
        UniqueConstraint(
            "news_item_id", "user_id", name="uq_campus_news_notification_user"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    news_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("campus_news_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class RagSource(Base, TimestampMixin):
    """One approved CUET web document and its latest ingestion state."""

    __tablename__ = "rag_sources"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active','unchanged','failed')", name="valid_status"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    content_hash: Mapped[str | None] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="active", index=True
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    crawled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    error_message: Mapped[str | None] = mapped_column(String(500))
    source_metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    chunks: Mapped[list["RagChunk"]] = relationship(
        back_populates="source", cascade="all, delete-orphan"
    )


class RagChunk(Base):
    """A searchable text chunk with its OpenAI embedding persisted in PostgreSQL."""

    __tablename__ = "rag_chunks"
    __table_args__ = (
        UniqueConstraint("source_id", "chunk_index", name="uq_rag_chunk_position"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rag_sources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    embedding: Mapped[list[float]] = mapped_column(JSON, nullable=False)

    source: Mapped[RagSource] = relationship(back_populates="chunks")


class RagQueryAudit(Base):
    """Minimal query audit used for per-user rate and cost safeguards."""

    __tablename__ = "rag_query_audits"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    source_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )


class TransportRoute(Base, TimestampMixin):
    __tablename__ = "transport_routes"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, unique=True)
    outbound_stops: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    return_stops: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )


class TransportBus(Base, TimestampMixin):
    __tablename__ = "transport_buses"
    __table_args__ = (
        CheckConstraint("bus_type IN ('student','teacher','staff')", name="valid_type"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    bus_type: Mapped[str] = mapped_column(String(16), nullable=False)
    registration: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )


class BusDriver(Base, TimestampMixin):
    __tablename__ = "bus_drivers"
    __table_args__ = (
        CheckConstraint("driver_class IN ('heavy','light')", name="valid_class"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_row: Mapped[int | None] = mapped_column(Integer, unique=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str] = mapped_column(String(24), nullable=False, unique=True)
    driver_class: Mapped[str] = mapped_column(String(12), nullable=False)
    assigned_bus_id: Mapped[str | None] = mapped_column(
        ForeignKey("transport_buses.id", ondelete="SET NULL"), index=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )


class TransportSchedule(Base, TimestampMixin):
    __tablename__ = "transport_schedules"
    __table_args__ = (
        CheckConstraint(
            "direction IN ('to-campus','from-campus','round-trip')",
            name="valid_direction",
        ),
        CheckConstraint(
            "recurrence IN ('once','daily','weekly','monthly')",
            name="valid_recurrence",
        ),
        CheckConstraint("end_time > start_time", name="valid_time_window"),
        UniqueConstraint(
            "service_date",
            "start_time",
            "bus_id",
            name="uq_transport_schedule_date_time_bus",
        ),
        Index("ix_transport_schedule_active_date", "is_active", "service_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    service_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)
    origin: Mapped[str] = mapped_column(String(180), nullable=False)
    destination: Mapped[str] = mapped_column(String(180), nullable=False)
    route_id: Mapped[str] = mapped_column(
        ForeignKey("transport_routes.id", ondelete="RESTRICT"), nullable=False
    )
    bus_id: Mapped[str] = mapped_column(
        ForeignKey("transport_buses.id", ondelete="RESTRICT"), nullable=False
    )
    driver_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("bus_drivers.id", ondelete="RESTRICT"), nullable=False
    )
    recurrence: Mapped[str] = mapped_column(
        String(12), nullable=False, server_default="once"
    )
    recurrence_until: Mapped[date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )
