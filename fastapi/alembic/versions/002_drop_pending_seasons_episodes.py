"""Drop pending column from media_tv_seasons and media_tv_episodes.

Seasons and episodes no longer have a pending state. A row existing in the
table means it has been seen. No row means not seen.

Revision ID: 002_drop_pending_tv
Revises: 001_nexreel_initial
Create Date: 2026-05-07
"""

from typing import Sequence, Union

from alembic import op

revision: str = "002_drop_pending_tv"
down_revision: Union[str, None] = "001_nexreel_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("media_tv_seasons", "pending")
    op.drop_column("media_tv_episodes", "pending")


def downgrade() -> None:
    op.add_column(
        "media_tv_seasons",
        op.Column("pending", op.BOOLEAN(), server_default="false", nullable=False),
    )
    op.add_column(
        "media_tv_episodes",
        op.Column("pending", op.BOOLEAN(), server_default="false", nullable=True),
    )
