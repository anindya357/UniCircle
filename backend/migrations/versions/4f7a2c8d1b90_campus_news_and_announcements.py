"""campus news and announcements

Revision ID: 4f7a2c8d1b90
Revises: 9e4a2b1c7d30
Create Date: 2026-09-26 12:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "4f7a2c8d1b90"
down_revision: str | None = "9e4a2b1c7d30"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "campus_news_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("kind", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.String(length=600), nullable=False),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("audience", sa.String(length=160), nullable=False),
        sa.Column(
            "status", sa.String(length=16), server_default="draft", nullable=False
        ),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column("author_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "kind IN ('news','update','announcement')",
            name=op.f("ck_campus_news_items_valid_kind"),
        ),
        sa.CheckConstraint(
            "status IN ('draft','published')",
            name=op.f("ck_campus_news_items_valid_status"),
        ),
        sa.ForeignKeyConstraint(
            ["author_id"],
            ["users.id"],
            ondelete="RESTRICT",
            name=op.f("fk_campus_news_items_author_id_users"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_campus_news_items")),
    )
    op.create_index(
        op.f("ix_campus_news_items_author_id"), "campus_news_items", ["author_id"]
    )
    op.create_index(
        op.f("ix_campus_news_items_published_at"),
        "campus_news_items",
        ["published_at"],
    )
    op.create_index(
        op.f("ix_campus_news_items_status"), "campus_news_items", ["status"]
    )
    op.create_index(
        "ix_campus_news_published",
        "campus_news_items",
        ["status", "published_at"],
    )

    op.create_table(
        "campus_news_notifications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("news_item_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("read_at", sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(
            ["news_item_id"],
            ["campus_news_items.id"],
            ondelete="CASCADE",
            name=op.f("fk_campus_news_notifications_news_item_id_campus_news_items"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
            name=op.f("fk_campus_news_notifications_user_id_users"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_campus_news_notifications")),
        sa.UniqueConstraint(
            "news_item_id", "user_id", name="uq_campus_news_notification_user"
        ),
    )
    op.create_index(
        op.f("ix_campus_news_notifications_news_item_id"),
        "campus_news_notifications",
        ["news_item_id"],
    )
    op.create_index(
        op.f("ix_campus_news_notifications_user_id"),
        "campus_news_notifications",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_campus_news_notifications_user_id"),
        table_name="campus_news_notifications",
    )
    op.drop_index(
        op.f("ix_campus_news_notifications_news_item_id"),
        table_name="campus_news_notifications",
    )
    op.drop_table("campus_news_notifications")
    op.drop_index("ix_campus_news_published", table_name="campus_news_items")
    op.drop_index(op.f("ix_campus_news_items_status"), table_name="campus_news_items")
    op.drop_index(
        op.f("ix_campus_news_items_published_at"), table_name="campus_news_items"
    )
    op.drop_index(
        op.f("ix_campus_news_items_author_id"), table_name="campus_news_items"
    )
    op.drop_table("campus_news_items")
