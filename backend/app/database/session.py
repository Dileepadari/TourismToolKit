"""Async database engine and session factory.

Replaces ``app/database/db.py``, which created a synchronous engine at *import
time* with ``echo=True`` unconditionally, no ``pool_pre_ping``, and left every
resolver to open its own ad-hoc ``Session(engine)``.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Engine, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

if TYPE_CHECKING:
    from app.core.config import Settings


def make_sync_engine(settings: Settings | None = None) -> Engine:
    """A synchronous engine for one-off scripts (seeding, migrations).

    psycopg 3 drives both sync and async from the same ``postgresql+psycopg://``
    URL, so this needs no separate driver or connection string.
    """
    if settings is None:
        from app.core.config import get_settings

        settings = get_settings()
    return create_engine(settings.database_url_sync, echo=settings.db_echo, pool_pre_ping=True)


def make_engine(settings: Settings) -> AsyncEngine:
    return create_async_engine(
        settings.database_url,  # postgresql+psycopg://... (normalised in Settings)
        echo=settings.db_echo,
        # Without pre-ping, every connection held across a Postgres restart or an
        # idle-timeout reaper surfaces as a random OperationalError.
        pool_pre_ping=True,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_recycle=settings.db_pool_recycle,
    )


def make_sessionmaker(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        engine,
        # SQLModel's AsyncSession, not SQLAlchemy's: it keeps `session.exec(select(...))`
        # working, so resolvers need `await` rather than a rewrite to `.execute().scalars()`.
        class_=AsyncSession,
        # The structural fix for the DetachedInstanceError family in the old
        # AuthService: attributes stay readable after commit and after the session
        # closes, which is exactly what the auth resolvers do with their results.
        expire_on_commit=False,
        autoflush=False,
    )
