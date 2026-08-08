"""Alembic environment.

Previously a stub: ``target_metadata`` was ``None`` and there were no revisions,
so ``alembic upgrade head`` and ``--autogenerate`` were both no-ops while the
schema was really created by ``SQLModel.metadata.create_all`` in three places.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

from app.core.config import get_settings

# Importing the models module is what registers the tables on SQLModel.metadata.
from app.database import models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    # `disable_existing_loggers` defaults to True, which disables every logger
    # not named in alembic.ini - including all of `app.*`. `bootstrap.py` runs
    # Alembic in-process, so migrating at startup silently killed the
    # application's own logging for the rest of the process.
    fileConfig(config.config_file_name, disable_existing_loggers=False)

# One source of truth for the URL. psycopg 3 serves both the sync driver Alembic
# uses here and the async engine the app uses, off the same URL.
#
# A URL already on the config wins, so callers that construct their own Config
# (the bootstrap helper, the test fixtures) can point migrations at a specific
# database instead of always getting the one from the environment.
if not config.get_main_option("sqlalchemy.url", None):
    config.set_main_option("sqlalchemy.url", get_settings().database_url_sync)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
