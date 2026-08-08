"""Reads over the caller's active sessions.

`logout(everywhere: true)` has worked since sessions became server-side, but
nothing in the interface exposed it and there was no way to see what was signed
in. The data has been in `refresh_tokens` all along.
"""

from __future__ import annotations

import strawberry
from sqlmodel import select

from app.core.cookies import REFRESH_COOKIE
from app.database.models import RefreshToken, utcnow
from app.graphql.context import Info
from app.graphql.types.tourism_types import SessionInfo
from app.services.sessions import PURPOSE_SESSION, hash_token


@strawberry.type
class SessionQuery:
    @strawberry.field
    async def get_active_sessions(self, info: Info) -> list[SessionInfo]:
        """Every live session for the caller, newest first."""
        user = await info.context.user()
        if user is None:
            return []

        raw = info.context.cookies.get(REFRESH_COOKIE)
        current_hash = hash_token(raw) if raw else None

        async with info.context.db() as session:
            rows = (
                await session.exec(
                    select(RefreshToken)
                    .where(
                        RefreshToken.user_id == user.id,
                        RefreshToken.purpose == PURPOSE_SESSION,
                        RefreshToken.revoked_at.is_(None),  # type: ignore[union-attr]
                        RefreshToken.expires_at > utcnow(),
                    )
                    .order_by(RefreshToken.created_at.desc())  # type: ignore
                )
            ).all()

        return [
            SessionInfo(
                id=row.id,  # type: ignore[arg-type]
                user_agent=row.user_agent,
                created_at=row.created_at,
                expires_at=row.expires_at,
                # Marked so the UI can label it and avoid offering to end it.
                is_current=current_hash is not None and row.token_hash == current_hash,
            )
            for row in rows
        ]
