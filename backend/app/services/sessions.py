"""Server-side session management.

A bare access token cannot be revoked, so signing out did nothing server-side and
a stolen token stayed valid for its whole lifetime. Sessions are now:

* a short-lived access token (minutes), carried in an HttpOnly cookie
* a long-lived refresh token (weeks), stored hashed in the database and rotated
  on every use

Rotation gives replay detection for free: a refresh token presented twice means
either the client raced itself or someone stole it, and the safe response to both
is to revoke the whole family.
"""

from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import Settings
from app.database.models import RefreshToken, User, utcnow

logger = logging.getLogger(__name__)


class SessionError(Exception):
    """A refresh attempt that cannot be honoured."""


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def issue_refresh_token(
    session: AsyncSession,
    user: User,
    settings: Settings,
    *,
    user_agent: str | None = None,
) -> str:
    """Create a new session and return the raw token (stored only as a hash)."""
    raw = secrets.token_urlsafe(48)
    record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw),
        expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
        user_agent=(user_agent or "")[:200] or None,
    )
    session.add(record)
    await session.commit()
    return raw


async def rotate_refresh_token(
    session: AsyncSession,
    raw_token: str,
    settings: Settings,
    *,
    user_agent: str | None = None,
) -> tuple[User, str]:
    """Exchange a refresh token for a fresh one, returning ``(user, new_token)``."""
    token_hash = hash_token(raw_token)
    record = (
        await session.exec(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    ).first()

    if record is None or record.purpose != PURPOSE_SESSION:
        raise SessionError("Your session has expired. Please sign in again.")

    if record.revoked_at is not None:
        if record.replaced_by is not None:
            # This token was *rotated*, and someone is presenting it again. Either
            # it was stolen or the client raced itself; in both cases the safe
            # move is to end every session for this user.
            logger.warning(
                "refresh token reuse detected for user id=%s; revoking all sessions",
                record.user_id,
            )
            await revoke_all_for_user(session, record.user_id)
        else:
            # Deliberately revoked by sign-out. Nothing suspicious happened, so
            # other devices keep their sessions.
            logger.info("refresh attempted with a signed-out token")
        raise SessionError("Your session has expired. Please sign in again.")

    if record.expires_at <= utcnow():
        raise SessionError("Your session has expired. Please sign in again.")

    user = await session.get(User, record.user_id)
    if user is None or not user.is_active:
        raise SessionError("Your session is no longer valid. Please sign in again.")

    replacement = secrets.token_urlsafe(48)
    record.revoked_at = utcnow()
    record.replaced_by = hash_token(replacement)
    session.add(record)
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(replacement),
            expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
            user_agent=(user_agent or "")[:200] or None,
        )
    )
    await session.commit()
    return user, replacement


async def revoke(session: AsyncSession, raw_token: str) -> None:
    """End one session. Unknown tokens are ignored - sign-out is idempotent."""
    record = (
        await session.exec(
            select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_token))
        )
    ).first()
    if record is None or record.revoked_at is not None:
        return
    record.revoked_at = utcnow()
    session.add(record)
    await session.commit()


async def revoke_all_for_user(session: AsyncSession, user_id: int) -> int:
    """Sign out everywhere. Returns the number of sessions ended."""
    records = (
        await session.exec(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.purpose == PURPOSE_SESSION,
                RefreshToken.revoked_at.is_(None),  # type: ignore[union-attr]
            )
        )
    ).all()
    now = utcnow()
    for record in records:
        record.revoked_at = now
        session.add(record)
    await session.commit()
    return len(records)


async def purge_expired(session: AsyncSession) -> int:
    """Drop rows whose tokens can no longer be presented."""
    stale = (
        await session.exec(select(RefreshToken).where(RefreshToken.expires_at <= utcnow()))
    ).all()
    for record in stale:
        await session.delete(record)
    await session.commit()
    return len(stale)


# --- Password reset ---------------------------------------------------------

# Reset tokens share the table with session tokens but are a different kind of
# credential, separated by the `purpose` column. They must never be
# interchangeable: a reset link redeemed as a session would be a privilege
# escalation.
PURPOSE_SESSION = "session"
PURPOSE_RESET = "password-reset"


async def issue_password_reset_token(session: AsyncSession, user: User, settings: Settings) -> str:
    """Create a single-use reset token valid for a short window."""
    raw = secrets.token_urlsafe(48)
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw),
            purpose=PURPOSE_RESET,
            expires_at=datetime.now(UTC)
            + timedelta(minutes=settings.password_reset_expire_minutes),
        )
    )
    await session.commit()
    return raw


async def consume_password_reset_token(session: AsyncSession, raw_token: str) -> User:
    """Validate and burn a reset token, returning the user it belongs to."""
    record = (
        await session.exec(
            select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_token))
        )
    ).first()

    if (
        record is None
        or record.purpose != PURPOSE_RESET
        or record.revoked_at is not None
        or record.expires_at <= utcnow()
    ):
        raise SessionError("This password reset link is invalid or has expired.")

    user = await session.get(User, record.user_id)
    if user is None or not user.is_active:
        raise SessionError("This password reset link is invalid or has expired.")

    # Single use.
    record.revoked_at = utcnow()
    session.add(record)
    await session.commit()
    return user
