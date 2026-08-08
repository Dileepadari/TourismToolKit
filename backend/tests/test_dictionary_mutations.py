"""Dictionary writes, with the IDOR regressions front and centre.

Every one of these mutations used to take `user_id: Int!` from the client and
"check ownership" by comparing that value against itself, so any caller could
read, edit and delete any other user's entries just by passing their id. The
argument is still accepted (deprecated) so existing clients keep working, but it
is ignored - identity comes from the bearer token.
"""

from __future__ import annotations

import pytest
from sqlmodel import select

from app.database.models import DictionaryEntry

ADD = """
mutation Add($input: DictionaryInput!) {
  addDictionaryEntry(input: $input) {
    success message entry { id word translation tags isFavorite }
  }
}
"""

ADD_WITH_LEGACY_USER_ID = """
mutation Add($input: DictionaryInput!, $userId: Int) {
  addDictionaryEntry(input: $input, userId: $userId) {
    success entry { id }
  }
}
"""

UPDATE = """
mutation Update($entryId: Int!, $input: DictionaryInput!, $userId: Int) {
  updateDictionaryEntry(entryId: $entryId, input: $input, userId: $userId) {
    success message entry { id word }
  }
}
"""

DELETE = """
mutation Delete($entryId: Int!, $userId: Int) {
  deleteDictionaryEntry(entryId: $entryId, userId: $userId) { success message }
}
"""

TOGGLE = """
mutation Toggle($entryId: Int!, $userId: Int) {
  toggleFavoriteEntry(entryId: $entryId, userId: $userId) {
    success message entry { id isFavorite }
  }
}
"""

GET_ONE = "query One($entryId: Int!) { getDictionaryEntry(entryId: $entryId) { id word } }"

ENTRY_INPUT = {
    "word": "water",
    "translation": "पानी",
    "languageFrom": "en",
    "languageTo": "hi",
    "tags": ["basics", "food"],
}


@pytest.fixture
async def alice_entry(execute, make_user):
    """An entry owned by Alice, plus Alice and an unrelated Bob."""
    alice = await make_user(email="alice@example.com", username="alice")
    bob = await make_user(email="bob@example.com", username="bob")
    result = await execute(ADD, {"input": ENTRY_INPUT}, user_id=alice.id)
    entry_id = result.data["addDictionaryEntry"]["entry"]["id"]
    return alice, bob, entry_id


# --- Happy paths ------------------------------------------------------------


async def test_add_entry(execute, make_user, session):
    user = await make_user()
    result = await execute(ADD, {"input": ENTRY_INPUT}, user_id=user.id)

    entry = result.data["addDictionaryEntry"]["entry"]
    assert result.data["addDictionaryEntry"]["success"] is True
    assert entry["word"] == "water"
    assert entry["tags"] == ["basics", "food"]

    # Readable after commit - the old code returned detached instances whose
    # attribute access raised once the session closed.
    row = await session.get(DictionaryEntry, entry["id"])
    assert row is not None and row.user_id == user.id


async def test_update_entry(execute, alice_entry):
    alice, _bob, entry_id = alice_entry
    result = await execute(
        UPDATE,
        {"entryId": entry_id, "input": {**ENTRY_INPUT, "word": "drinking water"}},
        user_id=alice.id,
    )
    assert result.data["updateDictionaryEntry"]["success"] is True
    assert result.data["updateDictionaryEntry"]["entry"]["word"] == "drinking water"


async def test_toggle_favorite_flips(execute, alice_entry):
    alice, _bob, entry_id = alice_entry

    first = await execute(TOGGLE, {"entryId": entry_id}, user_id=alice.id)
    assert first.data["toggleFavoriteEntry"]["entry"]["isFavorite"] is True

    second = await execute(TOGGLE, {"entryId": entry_id}, user_id=alice.id)
    assert second.data["toggleFavoriteEntry"]["entry"]["isFavorite"] is False


async def test_delete_entry(execute, alice_entry, session):
    alice, _bob, entry_id = alice_entry
    result = await execute(DELETE, {"entryId": entry_id}, user_id=alice.id)

    assert result.data["deleteDictionaryEntry"]["success"] is True
    assert (
        await session.exec(select(DictionaryEntry).where(DictionaryEntry.id == entry_id))
    ).first() is None


# --- IDOR regressions -------------------------------------------------------


@pytest.mark.parametrize(
    ("document", "variables", "field"),
    [
        (UPDATE, {"input": ENTRY_INPUT}, "updateDictionaryEntry"),
        (DELETE, {}, "deleteDictionaryEntry"),
        (TOGGLE, {}, "toggleFavoriteEntry"),
    ],
)
async def test_other_users_cannot_mutate_your_entry(
    execute, alice_entry, document, variables, field
):
    alice, bob, entry_id = alice_entry

    # Bob passes *Alice's* user id, which is exactly the bypass the old
    # implementation allowed.
    result = await execute(
        document, {"entryId": entry_id, "userId": alice.id, **variables}, user_id=bob.id
    )

    assert result.data[field]["success"] is False
    # Same message as a genuinely missing entry, so ids cannot be probed.
    assert result.data[field]["message"] == "Dictionary entry not found."


async def test_other_users_cannot_read_your_entry(execute, alice_entry):
    _alice, bob, entry_id = alice_entry
    result = await execute(GET_ONE, {"entryId": entry_id}, user_id=bob.id)
    assert result.data["getDictionaryEntry"] is None


async def test_entry_survives_a_failed_idor_attempt(execute, alice_entry):
    alice, bob, entry_id = alice_entry
    await execute(DELETE, {"entryId": entry_id, "userId": alice.id}, user_id=bob.id)

    still_there = await execute(GET_ONE, {"entryId": entry_id}, user_id=alice.id)
    assert still_there.data["getDictionaryEntry"]["id"] == entry_id


async def test_missing_entry_is_indistinguishable_from_someone_elses(execute, alice_entry):
    _alice, bob, _entry_id = alice_entry
    result = await execute(DELETE, {"entryId": 999_999}, user_id=bob.id)
    assert result.data["deleteDictionaryEntry"]["message"] == "Dictionary entry not found."


# --- Authentication ---------------------------------------------------------


@pytest.mark.parametrize(
    ("document", "variables", "field"),
    [
        (ADD, {"input": ENTRY_INPUT}, "addDictionaryEntry"),
        (UPDATE, {"entryId": 1, "input": ENTRY_INPUT}, "updateDictionaryEntry"),
        (DELETE, {"entryId": 1}, "deleteDictionaryEntry"),
        (TOGGLE, {"entryId": 1}, "toggleFavoriteEntry"),
    ],
)
async def test_writes_require_authentication(execute, document, variables, field):
    result = await execute(document, variables)
    assert result.data[field]["success"] is False
    assert "sign in" in result.data[field]["message"].lower()


async def test_legacy_user_id_argument_is_ignored_not_rejected(execute, make_user):
    """Clients still sending `userId` must keep working - and must not be trusted."""
    owner = await make_user(email="owner@example.com", username="owner")
    other = await make_user(email="other@example.com", username="other")

    result = await execute(
        ADD_WITH_LEGACY_USER_ID,
        {"input": ENTRY_INPUT, "userId": other.id},
        user_id=owner.id,
    )

    assert result.errors is None
    assert result.data["addDictionaryEntry"]["success"] is True

    # The entry belongs to the token holder, not the id that was passed.
    entry_id = result.data["addDictionaryEntry"]["entry"]["id"]
    visible_to_other = await execute(GET_ONE, {"entryId": entry_id}, user_id=other.id)
    assert visible_to_other.data["getDictionaryEntry"] is None
