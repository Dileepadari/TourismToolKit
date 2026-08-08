"""Registration and login.

The headline regression here is that `register` *persists a row*. The mutation
that shipped was a mock: it returned `success: true` with a valid JWT for
`user_id=1` and never touched the database, so every signup silently failed and
the follow-up login was guaranteed to fail too.
"""

from __future__ import annotations

import pytest
from sqlmodel import select

from app.database.models import User

REGISTER = """
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    success
    message
    token
    user { id email username }
  }
}
"""

LOGIN = """
mutation Login($input: LoginInput!) {
  login(input: $input) {
    success
    message
    token
    user { id email }
  }
}
"""

ME = "{ me { id email username } }"


async def test_register_persists_a_user(execute, session):
    result = await execute(
        REGISTER,
        {
            "input": {
                "email": "New.User@Example.com",
                "username": "newuser",
                "password": "correcthorse1",
            }
        },
    )

    assert result.errors is None
    payload = result.data["register"]
    assert payload["success"] is True
    # The credential is delivered as an HttpOnly cookie, so the body carries none.
    assert payload["token"] is None

    # The actual regression: a row exists.
    row = (await session.exec(select(User).where(User.username == "newuser"))).first()
    assert row is not None
    assert row.id == payload["user"]["id"]
    # Email is normalised to lowercase so lookups are consistent.
    assert row.email == "new.user@example.com"
    assert row.password_hash.startswith("$2")  # a real bcrypt digest


async def test_register_then_login_round_trips(execute):
    await execute(
        REGISTER,
        {
            "input": {
                "email": "round@trip.com",
                "username": "roundtrip",
                "password": "correcthorse1",
            }
        },
    )
    result = await execute(
        LOGIN, {"input": {"email": "round@trip.com", "password": "correcthorse1"}}
    )

    assert result.data["login"]["success"] is True
    assert result.data["login"]["user"]["email"] == "round@trip.com"


@pytest.mark.parametrize("field", ["email", "username"])
async def test_register_rejects_duplicates(execute, make_user, field):
    user = await make_user()
    payload = {"email": "other@example.com", "username": "other", "password": "correcthorse1"}
    payload[field] = getattr(user, field)

    result = await execute(REGISTER, {"input": payload})

    assert result.data["register"]["success"] is False
    assert result.data["register"]["token"] is None
    # Deliberately vague so the endpoint cannot be used to enumerate accounts.
    assert "already exists" in result.data["register"]["message"]


async def test_register_rejects_short_password(execute):
    result = await execute(
        REGISTER, {"input": {"email": "a@b.com", "username": "shortpw", "password": "abc"}}
    )
    assert result.data["register"]["success"] is False
    assert "8 characters" in result.data["register"]["message"]


async def test_login_rejects_wrong_password(execute, make_user):
    user = await make_user(password="correcthorse1")
    result = await execute(LOGIN, {"input": {"email": user.email, "password": "wrong"}})

    assert result.data["login"]["success"] is False
    assert result.data["login"]["token"] is None


async def test_login_message_does_not_reveal_whether_the_account_exists(execute, make_user):
    user = await make_user()
    wrong_password = await execute(LOGIN, {"input": {"email": user.email, "password": "wrong"}})
    no_such_user = await execute(
        LOGIN, {"input": {"email": "nobody@example.com", "password": "wrong"}}
    )

    assert wrong_password.data["login"]["message"] == no_such_user.data["login"]["message"]


async def test_login_rejects_inactive_account(execute, make_user, session):
    user = await make_user()
    user.is_active = False
    session.add(user)
    await session.commit()

    result = await execute(LOGIN, {"input": {"email": user.email, "password": "correcthorse1"}})
    assert result.data["login"]["success"] is False


async def test_me_reflects_the_bearer_token(execute, make_user):
    user = await make_user()

    authenticated = await execute(ME, user_id=user.id)
    assert authenticated.data["me"]["email"] == user.email

    anonymous = await execute(ME)
    assert anonymous.data["me"] is None
