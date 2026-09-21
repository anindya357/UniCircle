"""CUET Raozan campus locations.

Revision ID: 20260921_0004
Revises: 20260921_0003
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260921_0004"
down_revision: str | None = "20260921_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "campus_locations",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("short_name", sa.String(12), nullable=False),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("address", sa.String(300), nullable=False),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("details", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("osm_type", sa.String(8), nullable=False),
        sa.Column("osm_id", sa.BigInteger(), nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column("sort_order", sa.Integer(), nullable=False, unique=True),
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
        sa.CheckConstraint(
            "latitude BETWEEN -90 AND 90",
            name=op.f("ck_campus_locations_valid_latitude"),
        ),
        sa.CheckConstraint(
            "longitude BETWEEN -180 AND 180",
            name=op.f("ck_campus_locations_valid_longitude"),
        ),
        sa.UniqueConstraint("osm_type", "osm_id", name="uq_campus_location_osm_ref"),
    )


def downgrade() -> None:
    op.drop_table("campus_locations")
