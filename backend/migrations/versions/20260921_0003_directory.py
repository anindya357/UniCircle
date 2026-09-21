"""CUET departments and department-specific faculty directory entries.

Revision ID: 20260921_0003
Revises: 20260921_0002
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260921_0003"
down_revision: str | None = "20260921_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "departments",
        sa.Column("code", sa.String(32), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("office_email", sa.String(254)),
        sa.Column("phone", sa.String(100)),
        sa.Column("address", sa.String(500)),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_table(
        "faculty_directory_entries",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("department_code", sa.String(32), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("designation", sa.String(100)),
        sa.Column("email", sa.String(254)),
        sa.Column("phone", sa.String(100)),
        sa.Column("office", sa.String(100)),
        sa.Column("profile_url", sa.String(500)),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["department_code"], ["departments.code"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint(
            "department_code", "source_id", name="uq_faculty_department_source"
        ),
    )
    op.create_index(
        "ix_faculty_directory_entries_department_code",
        "faculty_directory_entries",
        ["department_code"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_faculty_directory_entries_department_code",
        table_name="faculty_directory_entries",
    )
    op.drop_table("faculty_directory_entries")
    op.drop_table("departments")
