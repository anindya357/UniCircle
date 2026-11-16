"""Allow membership reapplication while preserving reviewed request history.

Revision ID: f6c2d83a9041
Revises: e42a7b1c9d50
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "f6c2d83a9041"
down_revision: str | None = "e42a7b1c9d50"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "uq_club_membership_pending_user",
        "club_membership_requests",
        ["club_id", "user_id"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )
    op.drop_constraint(
        "uq_club_membership_request_user", "club_membership_requests", type_="unique"
    )


def downgrade() -> None:
    # PostgreSQL rejects this downgrade if repeated applications now exist.
    # Creating the constraint first keeps history and the pending index intact.
    op.create_unique_constraint(
        "uq_club_membership_request_user",
        "club_membership_requests",
        ["club_id", "user_id"],
    )
    op.drop_index(
        "uq_club_membership_pending_user", table_name="club_membership_requests"
    )
