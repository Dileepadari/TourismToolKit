"""Cookie sessions: rotation, revocation and replay detection.

The previous model was a single stateless 7-day JWT held in localStorage. It
could not be revoked, so signing out did nothing server-side, and any XSS could
read it.
"""

from __future__ import annotations

import pytest
from sqlmodel import select

from app.core.cookies import ACCESS_COOKIE, REFRESH_COOKIE, SESSION_HINT_COOKIE
from app.database.models import RefreshToken
from app.services import sessions

REGISTER = """
mutation Register($input: RegisterInput!) {
  register(input: $input) { success token user { id email } }
}
"""


# --- Service layer ----------------------------------------------------------


async def test_only_the_hash_is_stored(session, make_user, settings):
    """A database leak must not hand the attacker usable sessions."""
    user = await make_user()
    raw = await sessions.issue_refresh_token(session, user, settings)

    record = (
        await session.exec(select(RefreshToken).where(RefreshToken.user_id == user.id))
    ).first()
    assert record is not None
    assert record.token_hash != raw
    assert record.token_hash == sessions.hash_token(raw)
    assert raw not in record.token_hash


async def test_rotation_returns_a_new_token_and_revokes_the_old(session, make_user, settings):
    user = await make_user()
    first = await sessions.issue_refresh_token(session, user, settings)

    rotated_user, second = await sessions.rotate_refresh_token(session, first, settings)

    assert rotated_user.id == user.id
    assert second != first

    old = (
        await session.exec(
            select(RefreshToken).where(RefreshToken.token_hash == sessions.hash_token(first))
        )
    ).first()
    assert old.revoked_at is not None
    assert old.replaced_by == sessions.hash_token(second)


async def test_replaying_a_rotated_token_revokes_the_whole_family(session, make_user, settings):
    """Reuse means the token leaked (or the client raced); end every session."""
    user = await make_user()
    first = await sessions.issue_refresh_token(session, user, settings)
    _user, second = await sessions.rotate_refresh_token(session, first, settings)

    with pytest.raises(sessions.SessionError):
        await sessions.rotate_refresh_token(session, first, settings)

    # The replacement is gone too, so the thief cannot keep the session alive.
    with pytest.raises(sessions.SessionError):
        await sessions.rotate_refresh_token(session, second, settings)


async def test_unknown_token_is_rejected(session, settings):
    with pytest.raises(sessions.SessionError):
        await sessions.rotate_refresh_token(session, "not-a-real-token", settings)


async def test_revoke_ends_one_session(session, make_user, settings):
    user = await make_user()
    keep = await sessions.issue_refresh_token(session, user, settings)
    drop = await sessions.issue_refresh_token(session, user, settings)

    await sessions.revoke(session, drop)

    with pytest.raises(sessions.SessionError):
        await sessions.rotate_refresh_token(session, drop, settings)
    # The other device stays signed in.
    assert await sessions.rotate_refresh_token(session, keep, settings)


async def test_revoke_all_signs_out_everywhere(session, make_user, settings):
    user = await make_user()
    tokens = [await sessions.issue_refresh_token(session, user, settings) for _ in range(3)]

    ended = await sessions.revoke_all_for_user(session, user.id)
    assert ended == 3

    for token in tokens:
        with pytest.raises(sessions.SessionError):
            await sessions.rotate_refresh_token(session, token, settings)


async def test_revoke_is_idempotent(session, make_user, settings):
    user = await make_user()
    token = await sessions.issue_refresh_token(session, user, settings)
    await sessions.revoke(session, token)
    await sessions.revoke(session, token)  # must not raise


async def test_deactivated_user_cannot_refresh(session, make_user, settings):
    user = await make_user()
    token = await sessions.issue_refresh_token(session, user, settings)

    user.is_active = False
    session.add(user)
    await session.commit()

    with pytest.raises(sessions.SessionError):
        await sessions.rotate_refresh_token(session, token, settings)


# --- Through the HTTP layer -------------------------------------------------


async def test_login_sets_httponly_cookies(client, unique_credentials):
    await client.post("/graphql", json={"query": REGISTER, "variables": unique_credentials})

    response = await client.post(
        "/graphql",
        json={
            "query": "mutation L($i: LoginInput!) { login(input: $i) { success } }",
            "variables": {
                "i": {
                    "email": unique_credentials["input"]["email"],
                    "password": unique_credentials["input"]["password"],
                }
            },
        },
    )

    header = response.headers.get_list("set-cookie")
    access = next(c for c in header if c.startswith(f"{ACCESS_COOKIE}="))
    refresh = next(c for c in header if c.startswith(f"{REFRESH_COOKIE}="))
    hint = next(c for c in header if c.startswith(f"{SESSION_HINT_COOKIE}="))

    # The credentials must be unreadable by script; the hint deliberately is not.
    assert "HttpOnly" in access
    assert "HttpOnly" in refresh
    assert "HttpOnly" not in hint
    # The refresh token is scoped to the endpoint that consumes it.
    assert "Path=/graphql" in refresh


async def test_refresh_rotates_the_cookie(client, unique_credentials):
    await client.post("/graphql", json={"query": REGISTER, "variables": unique_credentials})
    before = client.cookies.get(REFRESH_COOKIE)

    response = await client.post(
        "/graphql", json={"query": "mutation { refreshSession { success } }"}
    )

    assert response.json()["data"]["refreshSession"]["success"] is True
    assert client.cookies.get(REFRESH_COOKIE) != before


async def test_logout_revokes_and_clears(client, unique_credentials):
    await client.post("/graphql", json={"query": REGISTER, "variables": unique_credentials})

    response = await client.post(
        "/graphql", json={"query": "mutation { logout { success sessionsEnded } }"}
    )
    assert response.json()["data"]["logout"]["sessionsEnded"] == 1

    # The session is gone server-side, not just locally.
    after = await client.post("/graphql", json={"query": "mutation { refreshSession { success } }"})
    assert after.json()["data"]["refreshSession"]["success"] is False

    me = await client.post("/graphql", json={"query": "{ me { id } }"})
    assert me.json()["data"]["me"] is None


async def test_refresh_without_a_cookie_is_a_clean_failure(client):
    response = await client.post(
        "/graphql", json={"query": "mutation { refreshSession { success message } }"}
    )
    payload = response.json()["data"]["refreshSession"]
    assert payload["success"] is False
    assert payload["message"] == "Not signed in."


# --- Password reset ---------------------------------------------------------


async def test_password_reset_does_not_reveal_whether_an_account_exists(client, make_user):
    """Otherwise this endpoint becomes an account-enumeration oracle."""
    user = await make_user(email="known@example.com", username="known")

    known = await client.post(
        "/graphql",
        json={
            "query": "mutation R($e: String!) { requestPasswordReset(email: $e) "
            "{ success message } }",
            "variables": {"e": user.email},
        },
    )
    unknown = await client.post(
        "/graphql",
        json={
            "query": "mutation R($e: String!) { requestPasswordReset(email: $e) "
            "{ success message } }",
            "variables": {"e": "nobody-at-all@example.com"},
        },
    )

    assert (
        known.json()["data"]["requestPasswordReset"]
        == (unknown.json()["data"]["requestPasswordReset"])
    )


async def test_reset_token_is_single_use(session, make_user, settings):
    user = await make_user()
    token = await sessions.issue_password_reset_token(session, user, settings)

    assert (await sessions.consume_password_reset_token(session, token)).id == user.id

    with pytest.raises(sessions.SessionError, match="invalid or has expired"):
        await sessions.consume_password_reset_token(session, token)


async def test_a_refresh_token_cannot_be_used_as_a_reset_token(session, make_user, settings):
    """The two share a table, so the marker has to actually separate them."""
    user = await make_user()
    refresh = await sessions.issue_refresh_token(session, user, settings)

    with pytest.raises(sessions.SessionError):
        await sessions.consume_password_reset_token(session, refresh)


async def test_a_reset_token_cannot_be_used_to_refresh(session, make_user, settings):
    user = await make_user()
    reset = await sessions.issue_password_reset_token(session, user, settings)

    with pytest.raises(sessions.SessionError):
        await sessions.rotate_refresh_token(session, reset, settings)


async def test_reset_rejects_an_unknown_token(session):
    with pytest.raises(sessions.SessionError):
        await sessions.consume_password_reset_token(session, "made-up")
