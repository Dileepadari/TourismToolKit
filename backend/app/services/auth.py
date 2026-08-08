"""Password hashing, user lookup and JWT issuance."""

from __future__ import annotations

import logging
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import Settings
from app.database.models import User

logger = logging.getLogger(__name__)

# bcrypt truncates silently above this in some implementations and raises in 5.x.
MAX_PASSWORD_BYTES = 72
MIN_PASSWORD_LENGTH = 8


class AuthError(Exception):
    """A failure that is safe to show the user."""


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise AuthError(
            f"Password is too long (bcrypt accepts at most {MAX_PASSWORD_BYTES} bytes)."
        )
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Constant-time check that never raises.

    The seeded ``system@tourismtoolkit.com`` account stores the literal string
    ``"system"`` rather than a bcrypt hash, which makes ``checkpw`` raise. That
    used to surface as a generic error swallowed by a bare ``except``.
    """
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        logger.warning("password hash is not a valid bcrypt digest; rejecting")
        return False


def create_access_token(user: User, settings: Settings) -> str:
    """Mint a JWT for ``user``.

    The old implementation always took its 15-minute default branch because no
    caller ever passed ``expires_delta``, while the frontend kept its auth cookie
    for seven days - users looked signed in holding a long-dead token.
    """
    if user.id is None:  # pragma: no cover - defensive
        raise AuthError("Cannot issue a token for an unsaved user")

    now = datetime.now(UTC)
    payload = {
        "sub": str(user.id),
        "user_id": user.id,  # retained so older clients keep working
        "email": user.email,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    secret = settings.jwt_secret_key.get_secret_value() if settings.jwt_secret_key else ""
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


async def create_user(
    session: AsyncSession,
    *,
    email: str,
    username: str,
    password: str,
    **fields: object,
) -> User:
    """Create a user, or raise ``AuthError`` with a user-safe message."""
    email = email.strip().lower()
    username = username.strip()

    if len(password) < MIN_PASSWORD_LENGTH:
        raise AuthError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")

    existing = (
        await session.exec(select(User).where((User.email == email) | (User.username == username)))
    ).first()
    if existing is not None:
        # Deliberately vague about which field collided.
        raise AuthError("An account with that email or username already exists.")

    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
        **fields,
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        # Lost a race against a concurrent signup; the unique index caught it.
        await session.rollback()
        raise AuthError("An account with that email or username already exists.") from None

    await session.refresh(user)
    return user


async def authenticate_user(session: AsyncSession, email: str, password: str) -> User:
    user = (await session.exec(select(User).where(User.email == email.strip().lower()))).first()

    # Same message for "no such user" and "wrong password" so the endpoint cannot
    # be used to enumerate registered emails.
    invalid = AuthError("Invalid email or password.")
    if user is None or not user.is_active:
        raise invalid
    if not verify_password(password, user.password_hash):
        raise invalid
    return user


def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)
