"""Per-request GraphQL context.

The router previously had no ``context_getter`` at all, so no resolver could see
the request. That is why every mutation took ``user_id: Int!`` as a *client
supplied argument* and "checked ownership" by comparing it against itself - any
caller could read, edit and delete any other user's entries.

Identity now comes from the bearer token and nowhere else.
"""

from __future__ import annotations

import dataclasses
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

import httpx
import jwt
import strawberry
from fastapi import Request
from strawberry.fastapi import BaseContext

from app.core.config import Settings
from app.core.cookies import ACCESS_COOKIE
from app.database.models import User

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from sqlmodel.ext.asyncio.session import AsyncSession

logger = logging.getLogger(__name__)


def decode_access_token(token: str | None, settings: Settings) -> int | None:
    """Validate a raw access token and return its user id."""
    if not token or not token.strip():
        return None
    try:
        payload = jwt.decode(
            token.strip(),
            settings.jwt_secret_key.get_secret_value() if settings.jwt_secret_key else "",
            # Pinning the algorithm is the guard against `alg: none` and
            # HS/RS confusion attacks; `require` forces expiry to be present.
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        return None

    # New tokens put the user id in `sub` as a string, per RFC 7519. Tokens minted
    # by the previous implementation put the *email* in `sub` and the id in
    # `user_id`, so fall back rather than force-logging-out existing sessions.
    for claim in ("sub", "user_id"):
        try:
            return int(payload[claim])
        except (KeyError, TypeError, ValueError):
            continue
    return None


def decode_bearer(header: str | None, settings: Settings) -> int | None:
    """Extract a user id from an ``Authorization: Bearer <jwt>`` header.

    Returns ``None`` for anything that is not a valid, unexpired token. The
    frontend sends an empty ``authorization`` header when logged out, so the
    empty case must be a quiet ``None`` rather than an error.
    """
    if not header:
        return None
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer":
        return None
    return decode_access_token(token, settings)


@dataclasses.dataclass
class Context(BaseContext):
    sessionmaker: async_sessionmaker[AsyncSession]
    settings: Settings
    http: httpx.AsyncClient
    user_id: int | None = None
    # Auth cookies are HttpOnly, so resolvers read them here rather than the
    # client reading them in JavaScript.
    cookies: dict[str, str] = dataclasses.field(default_factory=dict)
    user_agent: str | None = None
    request_id: str | None = None
    client_ip: str = "unknown"
    _user: User | None = dataclasses.field(default=None, repr=False)
    _user_loaded: bool = dataclasses.field(default=False, repr=False)

    def __post_init__(self) -> None:
        # strawberry's FastAPI integration assigns `request`/`response` after the
        # context_getter returns. A Context built directly (tests, scripts) never
        # gets them, so give them defaults rather than let attribute access raise.
        for attribute in ("request", "response", "background_tasks"):
            if not hasattr(self, attribute):
                setattr(self, attribute, None)

    @asynccontextmanager
    async def db(self) -> AsyncIterator[AsyncSession]:
        """A database session scoped to one resolver.

        GraphQL executes sibling root fields *concurrently*, and an AsyncSession
        is not safe for concurrent use - sharing one across a request raises
        "this session is provisioning a new connection" as soon as a client asks
        for two fields at once. A session per resolver lets those run in
        parallel on separate pooled connections.

        Mutations are unaffected: the spec requires them to execute serially.
        """
        async with self.sessionmaker() as session:
            yield session

    async def user(self) -> User | None:
        """The authenticated user, loaded once per request.

        `expire_on_commit=False` on the sessionmaker is what lets the loaded
        instance stay readable after its session closes.
        """
        if self._user_loaded:
            return self._user
        self._user_loaded = True
        if self.user_id is not None:
            async with self.db() as session:
                found = await session.get(User, self.user_id)
            # A token for a since-deactivated account must not keep working.
            self._user = found if found and found.is_active else None
        return self._user


Info = strawberry.Info[Context, None]


class IsAuthenticated(strawberry.BasePermission):
    """For fields with no result-envelope type of their own."""

    message = "Authentication required"

    async def has_permission(self, source: object, info: Info, **kwargs: object) -> bool:
        return await info.context.user() is not None


def _client_ip(request: Request) -> str:
    """Best-effort client address for anonymous rate limiting.

    `X-Forwarded-For` is only trustworthy behind a proxy that sets it; the direct
    peer address is the fallback.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def get_context(request: Request) -> AsyncIterator[Context]:
    """Build the per-request context.

    This is a ``context_getter`` rather than a router dependency because a
    FastAPI ``Depends`` never reaches a Strawberry resolver - resolvers only see
    ``info.context``. It hands over the session *factory*: see ``Context.db``.
    """
    state = request.app.state
    settings = state.settings

    # Cookie first, Authorization header second: browsers use the HttpOnly
    # cookie, while scripts and API clients that cannot hold cookies keep
    # working with a bearer token.
    user_id = decode_access_token(request.cookies.get(ACCESS_COOKIE), settings)
    if user_id is None:
        user_id = decode_bearer(request.headers.get("authorization"), settings)

    yield Context(
        sessionmaker=state.sessionmaker,
        settings=settings,
        http=state.http,
        user_id=user_id,
        cookies=dict(request.cookies),
        user_agent=request.headers.get("user-agent"),
        request_id=getattr(request.state, "request_id", None),
        client_ip=_client_ip(request),
    )
