"""Bring the database schema to head, safely, on any starting state.

Encodes the stamp-vs-upgrade decision so nobody has to remember it:

* fresh database                      -> ``upgrade head``
* already under Alembic               -> ``upgrade head``
* pre-Alembic, built by ``create_all`` -> ``stamp head`` (the tables already
  exist; running the initial migration would fail on "relation already exists")
"""

from __future__ import annotations

import logging
import sys
import time
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.database.session import make_sync_engine

logger = logging.getLogger(__name__)

ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"


def alembic_config(database_url: str | None = None) -> Config:
    config = Config(str(ALEMBIC_INI))
    if database_url:
        config.set_main_option("sqlalchemy.url", database_url)
    return config


def wait_for_db(*, attempts: int = 30, delay: float = 1.0) -> None:
    """Block until the database accepts connections."""
    engine = make_sync_engine()
    last: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("database is ready")
            return
        except Exception as exc:
            last = exc
            logger.info("waiting for database (%d/%d)", attempt, attempts)
            time.sleep(delay)
    raise RuntimeError(f"database did not become ready after {attempts} attempts") from last


def bootstrap() -> None:
    engine = make_sync_engine()
    with engine.connect() as connection:
        tables = set(inspect(connection).get_table_names())

    config = alembic_config()

    if "alembic_version" in tables:
        logger.info("database is under Alembic control; upgrading to head")
        command.upgrade(config, "head")
    elif "users" in tables:
        logger.warning(
            "found an existing schema with no alembic_version table (created by the old "
            "create_all path); stamping head instead of re-running the initial migration"
        )
        command.stamp(config, "head")
    else:
        logger.info("empty database; applying all migrations")
        command.upgrade(config, "head")


def main() -> None:
    configure_logging(get_settings())
    try:
        wait_for_db()
        bootstrap()
    except Exception:
        logger.exception("database bootstrap failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
