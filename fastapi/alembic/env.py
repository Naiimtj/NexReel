from alembic import context
from sqlalchemy import pool

from api.config.env import settings
from api.core.database.database import engine

config = context.config

target_metadata = None


def run_migrations_offline():
    context.configure(
        url=settings.sqlalchemy_database_url,
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
