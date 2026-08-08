"""Password hashing and JWT issuance."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import jwt
import pytest
import time_machine

from app.core.config import Settings
from app.database.models import User
from app.graphql.context import decode_bearer
from app.services import auth

SECRET = "test-secret-key-long-enough-to-pass-validation-000000"


@pytest.fixture
def settings() -> Settings:
    return Settings(_env_file=None, JWT_SECRET_KEY=SECRET)  # type: ignore[call-arg]


@pytest.fixture
def user() -> User:
    return User(id=7, email="user@example.com", username="user", password_hash="x")


# --- Passwords --------------------------------------------------------------


def test_hash_and_verify_round_trip():
    digest = auth.hash_password("correcthorse1")
    assert auth.verify_password("correcthorse1", digest) is True
    assert auth.verify_password("wrong", digest) is False


def test_verify_password_returns_false_for_a_non_bcrypt_hash():
    """The seeded system account stored the literal string "system".

    bcrypt raises on that, which the old bare `except` turned into a generic
    "invalid credentials" - working by accident.
    """
    assert auth.verify_password("anything", "system") is False
    assert auth.verify_password("anything", "!unusable") is False
    assert auth.verify_password("anything", "") is False


def test_password_over_the_bcrypt_limit_is_rejected_clearly():
    with pytest.raises(auth.AuthError, match="too long"):
        auth.hash_password("a" * 73)


def test_password_at_the_bcrypt_limit_is_accepted():
    assert auth.hash_password("a" * 72)


# --- Tokens -----------------------------------------------------------------


def test_token_uses_the_configured_expiry(settings, user):
    """Regression: every token used to expire in 15 minutes.

    `create_access_token` was always called without `expires_delta`, so it took
    its 15-minute default branch - while the frontend kept its auth cookie for
    seven days, leaving users apparently signed in with a dead token.
    """
    token = auth.create_access_token(user, settings)
    claims = jwt.decode(token, SECRET, algorithms=["HS256"])

    lifetime = claims["exp"] - claims["iat"]
    assert lifetime == settings.access_token_expire_minutes * 60
    assert lifetime == 15 * 60


def test_token_decodes_back_to_the_user_id(settings, user):
    token = auth.create_access_token(user, settings)
    assert decode_bearer(f"Bearer {token}", settings) == 7


def test_expired_token_is_rejected(settings, user):
    with time_machine.travel(datetime(2026, 1, 1, tzinfo=UTC)):
        token = auth.create_access_token(user, settings)

    later = datetime(2026, 1, 1, tzinfo=UTC) + timedelta(days=8)
    with time_machine.travel(later):
        assert decode_bearer(f"Bearer {token}", settings) is None


def test_tampered_signature_is_rejected(settings, user):
    token = auth.create_access_token(user, settings)
    forged = jwt.encode(
        {"sub": "1", "exp": 9_999_999_999},
        "different-secret-also-long-enough-000000",
        algorithm="HS256",
    )

    assert decode_bearer(f"Bearer {forged}", settings) is None
    assert decode_bearer(f"Bearer {token}x", settings) is None


def test_alg_none_token_is_rejected(settings):
    """Pinning `algorithms=` is what makes this a non-issue."""
    forged = jwt.encode({"sub": "1", "exp": 9_999_999_999}, key="", algorithm="none")
    assert decode_bearer(f"Bearer {forged}", settings) is None


def test_token_without_expiry_is_rejected(settings):
    forged = jwt.encode({"sub": "1"}, SECRET, algorithm="HS256")
    assert decode_bearer(f"Bearer {forged}", settings) is None


def test_legacy_token_shape_still_decodes(settings):
    """Tokens minted by the old code put the email in `sub` and the id in `user_id`."""
    legacy = jwt.encode(
        {"sub": "user@example.com", "user_id": 7, "exp": 9_999_999_999},
        SECRET,
        algorithm="HS256",
    )
    assert decode_bearer(f"Bearer {legacy}", settings) == 7


@pytest.mark.parametrize(
    "header",
    [None, "", "   ", "Bearer", "Bearer ", "Basic abc", "not-a-header"],
)
def test_malformed_authorization_headers_are_quietly_anonymous(settings, header):
    """The frontend sends an empty header when signed out; it must not raise."""
    assert decode_bearer(header, settings) is None
