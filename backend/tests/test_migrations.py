"""Migrations, and the stamp-vs-upgrade bootstrap decision.

The bootstrap branch matters because deployments that predate Alembic already
have tables created by `SQLModel.metadata.create_all`. Running `upgrade head`
against those fails on "relation already exists"; they have to be stamped.
"""

from __future__ import annotations

import uuid

import pytest
from alembic import command
from alembic.util.exc import CommandError
from sqlalchemy import create_engine, inspect, text
from sqlmodel import SQLModel

from app.database.bootstrap import alembic_config


@pytest.fixture
def scratch_db(postgres_url: str):
    """A throwaway database, dropped afterwards."""
    name = f"scratch_{uuid.uuid4().hex[:12]}"
    admin_url = postgres_url.rsplit("/", 1)[0] + "/postgres"
    admin = create_engine(admin_url, isolation_level="AUTOCOMMIT")

    with admin.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{name}"'))

    url = postgres_url.rsplit("/", 1)[0] + f"/{name}"
    try:
        yield url
    finally:
        engine = create_engine(url)
        engine.dispose()
        with admin.connect() as conn:
            conn.execute(
                text(
                    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                    f"WHERE datname = '{name}'"
                )
            )
            conn.execute(text(f'DROP DATABASE IF EXISTS "{name}"'))
        admin.dispose()


def table_names(url: str) -> set[str]:
    engine = create_engine(url)
    try:
        with engine.connect() as conn:
            return set(inspect(conn).get_table_names())
    finally:
        engine.dispose()


EXPECTED_TABLES = {
    "users",
    "dictionary_entries",
    "travel_history",
    "places",
    "emergency_contacts",
    "culture_tips",
}


def test_upgrade_creates_the_full_schema(scratch_db: str):
    command.upgrade(alembic_config(scratch_db), "head")
    assert table_names(scratch_db) >= EXPECTED_TABLES
    assert "alembic_version" in table_names(scratch_db)


def test_autogenerate_detects_no_drift(scratch_db: str):
    """The migration and the models must describe the same schema."""
    command.upgrade(alembic_config(scratch_db), "head")
    # `alembic check` raises when it finds operations to generate.
    command.check(alembic_config(scratch_db))


def test_downgrade_upgrade_round_trip(scratch_db: str):
    config = alembic_config(scratch_db)
    command.upgrade(config, "head")
    command.downgrade(config, "base")

    remaining = table_names(scratch_db)
    assert not (EXPECTED_TABLES & remaining)

    command.upgrade(config, "head")
    assert table_names(scratch_db) >= EXPECTED_TABLES


def test_unique_indexes_and_foreign_keys_exist(scratch_db: str):
    command.upgrade(alembic_config(scratch_db), "head")
    engine = create_engine(scratch_db)
    try:
        with engine.connect() as conn:
            inspector = inspect(conn)
            user_indexes = {i["name"]: i for i in inspector.get_indexes("users")}
            assert user_indexes["ix_users_email"]["unique"] is True
            assert user_indexes["ix_users_username"]["unique"] is True

            for table in ("dictionary_entries", "travel_history"):
                fks = inspector.get_foreign_keys(table)
                assert any(fk["referred_table"] == "users" for fk in fks)
    finally:
        engine.dispose()


def test_rating_check_constraint_is_enforced(scratch_db: str):
    """Declared as `Field(ge=1, le=5)`, which is pydantic-only without this."""
    command.upgrade(alembic_config(scratch_db), "head")
    engine = create_engine(scratch_db)
    try:
        with engine.begin() as conn, pytest.raises(Exception, match="ck_places_rating_range"):
            conn.execute(
                text(
                    "INSERT INTO places (name, country, city, rating, created_at) "
                    "VALUES ('Bad', 'India', 'X', 9.5, now())"
                )
            )
    finally:
        engine.dispose()


def test_bootstrap_upgrades_an_empty_database(scratch_db: str, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", scratch_db)
    from app.core.config import get_settings
    from app.database import bootstrap as bootstrap_module

    get_settings.cache_clear()
    bootstrap_module.bootstrap()

    assert table_names(scratch_db) >= EXPECTED_TABLES
    get_settings.cache_clear()


def test_bootstrap_stamps_a_pre_alembic_schema(scratch_db: str, monkeypatch):
    """The create_all path: tables exist, alembic_version does not."""
    engine = create_engine(scratch_db)
    try:
        with engine.begin() as conn:
            # create_all builds the trigram indexes, which need the extension.
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        SQLModel.metadata.create_all(engine)
    finally:
        engine.dispose()

    assert "alembic_version" not in table_names(scratch_db)

    monkeypatch.setenv("DATABASE_URL", scratch_db)
    from app.core.config import get_settings
    from app.database import bootstrap as bootstrap_module

    get_settings.cache_clear()
    bootstrap_module.bootstrap()

    # Stamped, not re-run - which would have failed on "relation already exists".
    assert "alembic_version" in table_names(scratch_db)
    get_settings.cache_clear()


def test_upgrade_head_against_a_create_all_schema_would_fail(scratch_db: str):
    """Demonstrates why the stamp branch is necessary."""
    engine = create_engine(scratch_db)
    try:
        with engine.begin() as conn:
            # create_all builds the trigram indexes, which need the extension.
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        SQLModel.metadata.create_all(engine)
    finally:
        engine.dispose()

    with pytest.raises((CommandError, Exception)):
        command.upgrade(alembic_config(scratch_db), "head")


def test_bootstrap_is_idempotent(scratch_db: str, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", scratch_db)
    from app.core.config import get_settings
    from app.database import bootstrap as bootstrap_module

    get_settings.cache_clear()
    bootstrap_module.bootstrap()
    bootstrap_module.bootstrap()

    assert table_names(scratch_db) >= EXPECTED_TABLES
    get_settings.cache_clear()
