"""transport schedules drivers and fleet

Revision ID: 0363e1e5ad21
Revises: 667afe78e4cf
Create Date: 2026-09-23 16:55:00.055562
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0363e1e5ad21"
down_revision: str | None = "667afe78e4cf"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "transport_buses",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("bus_type", sa.String(length=16), nullable=False),
        sa.Column("registration", sa.String(length=80), nullable=False),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
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
            "bus_type IN ('student','teacher','staff')",
            name=op.f("ck_transport_buses_valid_type"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_transport_buses")),
        sa.UniqueConstraint("name", name=op.f("uq_transport_buses_name")),
        sa.UniqueConstraint(
            "registration", name=op.f("uq_transport_buses_registration")
        ),
    )
    op.create_table(
        "transport_routes",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("outbound_stops", sa.JSON(), nullable=False),
        sa.Column("return_stops", sa.JSON(), nullable=False),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
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
        sa.PrimaryKeyConstraint("id", name=op.f("pk_transport_routes")),
        sa.UniqueConstraint("name", name=op.f("uq_transport_routes_name")),
    )
    op.create_table(
        "bus_drivers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_row", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("phone", sa.String(length=24), nullable=False),
        sa.Column("driver_class", sa.String(length=12), nullable=False),
        sa.Column("assigned_bus_id", sa.String(length=80), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
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
            "driver_class IN ('heavy','light')", name=op.f("ck_bus_drivers_valid_class")
        ),
        sa.ForeignKeyConstraint(
            ["assigned_bus_id"],
            ["transport_buses.id"],
            name=op.f("fk_bus_drivers_assigned_bus_id_transport_buses"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bus_drivers")),
        sa.UniqueConstraint("phone", name=op.f("uq_bus_drivers_phone")),
        sa.UniqueConstraint("source_row", name=op.f("uq_bus_drivers_source_row")),
    )
    op.create_index(
        op.f("ix_bus_drivers_assigned_bus_id"),
        "bus_drivers",
        ["assigned_bus_id"],
        unique=False,
    )
    op.create_table(
        "transport_schedules",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("service_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("direction", sa.String(length=16), nullable=False),
        sa.Column("origin", sa.String(length=180), nullable=False),
        sa.Column("destination", sa.String(length=180), nullable=False),
        sa.Column("route_id", sa.String(length=80), nullable=False),
        sa.Column("bus_id", sa.String(length=80), nullable=False),
        sa.Column("driver_id", sa.Uuid(), nullable=False),
        sa.Column(
            "recurrence", sa.String(length=12), server_default="once", nullable=False
        ),
        sa.Column("recurrence_until", sa.Date(), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
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
            "direction IN ('to-campus','from-campus','round-trip')",
            name=op.f("ck_transport_schedules_valid_direction"),
        ),
        sa.CheckConstraint(
            "recurrence IN ('once','daily','weekly','monthly')",
            name=op.f("ck_transport_schedules_valid_recurrence"),
        ),
        sa.CheckConstraint(
            "end_time > start_time",
            name=op.f("ck_transport_schedules_valid_time_window"),
        ),
        sa.ForeignKeyConstraint(
            ["bus_id"],
            ["transport_buses.id"],
            name=op.f("fk_transport_schedules_bus_id_transport_buses"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["driver_id"],
            ["bus_drivers.id"],
            name=op.f("fk_transport_schedules_driver_id_bus_drivers"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["route_id"],
            ["transport_routes.id"],
            name=op.f("fk_transport_schedules_route_id_transport_routes"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_transport_schedules")),
        sa.UniqueConstraint(
            "service_date",
            "start_time",
            "bus_id",
            name="uq_transport_schedule_date_time_bus",
        ),
    )
    op.create_index(
        "ix_transport_schedule_active_date",
        "transport_schedules",
        ["is_active", "service_date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_transport_schedule_active_date", table_name="transport_schedules")
    op.drop_table("transport_schedules")
    op.drop_index(op.f("ix_bus_drivers_assigned_bus_id"), table_name="bus_drivers")
    op.drop_table("bus_drivers")
    op.drop_table("transport_routes")
    op.drop_table("transport_buses")
