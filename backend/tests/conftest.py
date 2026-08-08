"""Shared test fixtures.

Tests run against a real PostgreSQL instance, not sqlite: `ilike`, the ordering
CASE in guide queries, and the migrations themselves are Postgres-specific, so
sqlite would be testing a different system than the one that ships.
"""

from __future__ import annotations

import os
import uuid
from collections.abc import AsyncIterator, Iterator
from typing import Any

import httpx
import pytest
import pytest_asyncio
import respx
from alembic import command
from asgi_lifespan import LifespanManager
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import Settings, get_settings
from app.database.bootstrap import alembic_config
from app.database.models import User
from app.graphql.context import Context
from app.graphql.schema import schema
from app.services import auth

TEST_SECRET = "test-secret-key-long-enough-to-pass-validation-000000"


# --- Database ---------------------------------------------------------------


@pytest.fixture(scope="session")
def postgres_url() -> Iterator[str]:
    """A Postgres to test against.

    Uses TEST_DATABASE_URL when set (CI provides a `services: postgres`), and
    otherwise starts a throwaway container so a local run needs no setup.
    """
    url = os.getenv("TEST_DATABASE_URL")
    if url:
        yield url
        return

    from testcontainers.postgres import PostgresContainer

    with PostgresContainer("postgres:18-alpine", driver="psycopg") as container:
        yield container.get_connection_url()


@pytest.fixture(scope="session")
def migrated_url(postgres_url: str) -> str:
    """Bring the test database to head, exercising the real migrations."""
    # psycopg 3 drives both sync and async off the same URL, so it is passed through
    # unchanged - stripping the driver would select psycopg2, which is not installed.
    command.upgrade(alembic_config(postgres_url), "head")
    return postgres_url


@pytest.fixture(scope="session")
def settings(migrated_url: str) -> Settings:
    return Settings(
        _env_file=None,  # type: ignore[call-arg]
        DATABASE_URL=migrated_url,
        JWT_SECRET_KEY=TEST_SECRET,
        ENVIRONMENT="development",
    )


@pytest_asyncio.fixture
async def engine(settings: Settings) -> AsyncIterator[Any]:
    # Function-scoped so it lives in the same event loop as the test that uses it.
    # Engines are lazy, so this costs nothing until a connection is opened.
    eng = create_async_engine(settings.database_url, poolclass=NullPool)
    yield eng
    await eng.dispose()


@pytest_asyncio.fixture
async def db_connection(engine: Any) -> AsyncIterator[Any]:
    """One connection, wrapped in a transaction that is always rolled back."""
    connection = await engine.connect()
    transaction = await connection.begin()
    try:
        yield connection
    finally:
        await transaction.rollback()
        await connection.close()


@pytest.fixture
def sessionmaker_for_tests(db_connection: Any):
    """A session factory bound to the single rolled-back connection.

    Resolvers each open their own session (see `Context.db`), so the factory has
    to hand out sessions that all live inside the same outer transaction -
    otherwise a resolver's writes would be invisible to the assertions.

    `join_transaction_mode="create_savepoint"` turns each resolver `commit()`
    into a savepoint release, so nothing escapes the rollback.
    """
    return async_sessionmaker(
        bind=db_connection,
        class_=AsyncSession,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )


@pytest_asyncio.fixture
async def session(sessionmaker_for_tests) -> AsyncIterator[AsyncSession]:
    """A session for tests that set up or assert on data directly."""
    async with sessionmaker_for_tests() as db:
        yield db


# --- HTTP -------------------------------------------------------------------


@pytest.fixture
def mock_http() -> Iterator[respx.MockRouter]:
    """Intercept all outbound HTTP.

    respx raises on any request that no route matches (`assert_all_mocked`, its
    default), so an un-mocked call fails loudly instead of quietly reaching
    canvas.iiit.ac.in from CI.
    """
    with respx.mock(assert_all_called=False, assert_all_mocked=True) as router:
        yield router


@pytest_asyncio.fixture
async def http_client() -> AsyncIterator[httpx.AsyncClient]:
    async with httpx.AsyncClient() as client:
        yield client


# --- GraphQL ----------------------------------------------------------------


@pytest.fixture
def make_context(sessionmaker_for_tests, settings: Settings, http_client: httpx.AsyncClient):
    def _make(user_id: int | None = None) -> Context:
        return Context(
            sessionmaker=sessionmaker_for_tests,
            settings=settings,
            http=http_client,
            user_id=user_id,
        )

    return _make


@pytest.fixture
def execute(make_context):
    """Run a GraphQL document against the real schema."""

    async def _execute(
        query: str,
        variables: dict[str, Any] | None = None,
        user_id: int | None = None,
    ):
        return await schema.execute(
            query, variable_values=variables, context_value=make_context(user_id)
        )

    return _execute


# --- Factories --------------------------------------------------------------


@pytest_asyncio.fixture
async def make_user(session: AsyncSession):
    counter = {"n": 0}

    async def _make(password: str = "correcthorse1", **overrides: Any) -> User:
        counter["n"] += 1
        n = counter["n"]
        return await auth.create_user(
            session,
            email=overrides.pop("email", f"user{n}@example.com"),
            username=overrides.pop("username", f"user{n}"),
            password=password,
            **overrides,
        )

    return _make


# --- ASGI-level client ------------------------------------------------------


@pytest_asyncio.fixture
async def client(settings: Settings, monkeypatch) -> AsyncIterator[httpx.AsyncClient]:
    """The real FastAPI app, wired to the test database."""
    monkeypatch.setenv("DATABASE_URL", settings.database_url)
    monkeypatch.setenv("JWT_SECRET_KEY", settings.jwt_secret_key.get_secret_value())
    monkeypatch.setenv("ENVIRONMENT", "development")
    get_settings.cache_clear()

    import importlib

    from app import main as main_module

    importlib.reload(main_module)

    async with LifespanManager(main_module.app):
        transport = httpx.ASGITransport(app=main_module.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c

    get_settings.cache_clear()


@pytest.fixture
def unique_credentials() -> dict[str, Any]:
    """Registration variables that will not collide across runs.

    Tests that go through the real app commit outside the rollback fixture.
    """
    tag = uuid.uuid4().hex[:10]
    return {
        "input": {
            "email": f"user-{tag}@example.com",
            "username": f"user{tag}",
            "password": "correcthorse1",
        }
    }
