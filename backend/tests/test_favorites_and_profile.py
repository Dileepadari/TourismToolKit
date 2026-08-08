"""Functionality that previously had UI but no implementation behind it.

The Heart and Share buttons on a place card had no handler; the settings form
showed name and country and reported success without persisting them; and
`logout(everywhere)` worked but nothing could enumerate sessions.
"""

from __future__ import annotations

import pytest
from sqlmodel import select

from app.database.models import Place, PlaceFavorite, TravelHistory

TOGGLE_PLACE = """
mutation Toggle($placeId: Int!) {
  toggleFavoritePlace(placeId: $placeId) { success message isFavorite }
}
"""
FAVORITE_IDS = "{ getFavoritePlaceIds }"
FAVORITE_PLACES = "{ getFavoritePlaces { id name } }"
UPDATE_PROFILE = """
mutation P($fullName: String, $homeCountry: String) {
  updateProfile(fullName: $fullName, homeCountry: $homeCountry) {
    success message user { id fullName homeCountry }
  }
}
"""
DELETE_TRIP = (
    "mutation D($entryId: Int!) { deleteTravelHistory(entryId: $entryId) { success message } }"
)
ADD_TRIP = """
mutation A($input: TravelHistoryInput!) {
  addTravelHistory(input: $input) { id destination country }
}
"""


@pytest.fixture
async def place(session) -> Place:
    row = Place(name="Taj Mahal", country="India", city="Agra", category="heritage")
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


# --- Place favourites -------------------------------------------------------


async def test_toggle_adds_then_removes(execute, make_user, place, session):
    user = await make_user()

    added = await execute(TOGGLE_PLACE, {"placeId": place.id}, user_id=user.id)
    assert added.data["toggleFavoritePlace"]["isFavorite"] is True
    assert "Taj Mahal" in added.data["toggleFavoritePlace"]["message"]

    removed = await execute(TOGGLE_PLACE, {"placeId": place.id}, user_id=user.id)
    assert removed.data["toggleFavoritePlace"]["isFavorite"] is False

    rows = (await session.exec(select(PlaceFavorite).where(PlaceFavorite.user_id == user.id))).all()
    assert rows == []


async def test_favouriting_requires_a_session(execute, place):
    result = await execute(TOGGLE_PLACE, {"placeId": place.id})
    assert result.data["toggleFavoritePlace"]["success"] is False
    assert "sign in" in result.data["toggleFavoritePlace"]["message"].lower()


async def test_unknown_place_is_rejected(execute, make_user):
    user = await make_user()
    result = await execute(TOGGLE_PLACE, {"placeId": 999_999}, user_id=user.id)
    assert result.data["toggleFavoritePlace"]["success"] is False


async def test_favourites_are_per_user(execute, make_user, place):
    alice = await make_user(email="a@x.com", username="a")
    bob = await make_user(email="b@x.com", username="b")

    await execute(TOGGLE_PLACE, {"placeId": place.id}, user_id=alice.id)

    assert (await execute(FAVORITE_IDS, user_id=alice.id)).data["getFavoritePlaceIds"] == [place.id]
    assert (await execute(FAVORITE_IDS, user_id=bob.id)).data["getFavoritePlaceIds"] == []


async def test_favorite_places_returns_full_records(execute, make_user, place):
    user = await make_user()
    await execute(TOGGLE_PLACE, {"placeId": place.id}, user_id=user.id)

    result = await execute(FAVORITE_PLACES, user_id=user.id)
    assert [p["name"] for p in result.data["getFavoritePlaces"]] == ["Taj Mahal"]


async def test_anonymous_favourites_are_empty(execute):
    assert (await execute(FAVORITE_IDS)).data["getFavoritePlaceIds"] == []


# --- Profile ----------------------------------------------------------------


async def test_profile_update_persists(execute, make_user, session):
    user = await make_user()

    result = await execute(
        UPDATE_PROFILE, {"fullName": "Ada Lovelace", "homeCountry": "UK"}, user_id=user.id
    )
    assert result.data["updateProfile"]["success"] is True
    assert result.data["updateProfile"]["user"]["fullName"] == "Ada Lovelace"

    # The actual regression: the row changed, not just the response. `refresh`
    # rather than `expire_all`, which defers IO and then trips MissingGreenlet.
    await session.refresh(user)
    assert user.full_name == "Ada Lovelace"
    assert user.home_country == "UK"


async def test_profile_update_trims_and_clears(execute, make_user, session):
    user = await make_user()

    # The mutation writes through its own session, so this one's copy has to be
    # refreshed before reading or it returns the pre-update values.
    await execute(UPDATE_PROFILE, {"fullName": "  Spaced  "}, user_id=user.id)
    await session.refresh(user)
    assert user.full_name == "Spaced"

    # An empty string clears rather than storing whitespace.
    await execute(UPDATE_PROFILE, {"fullName": "   "}, user_id=user.id)
    await session.refresh(user)
    assert user.full_name is None


async def test_profile_update_requires_a_session(execute):
    result = await execute(UPDATE_PROFILE, {"fullName": "Nobody"})
    assert result.data["updateProfile"]["success"] is False


# --- Travel history ---------------------------------------------------------


async def test_trip_can_be_deleted(execute, make_user, session):
    user = await make_user()
    added = await execute(
        ADD_TRIP, {"input": {"destination": "Jaipur", "country": "India"}}, user_id=user.id
    )
    trip_id = added.data["addTravelHistory"]["id"]

    result = await execute(DELETE_TRIP, {"entryId": trip_id}, user_id=user.id)
    assert result.data["deleteTravelHistory"]["success"] is True
    assert await session.get(TravelHistory, trip_id) is None


async def test_one_user_cannot_delete_anothers_trip(execute, make_user, session):
    owner = await make_user(email="owner@x.com", username="owner")
    other = await make_user(email="other@x.com", username="other")

    added = await execute(
        ADD_TRIP, {"input": {"destination": "Goa", "country": "India"}}, user_id=owner.id
    )
    trip_id = added.data["addTravelHistory"]["id"]

    result = await execute(DELETE_TRIP, {"entryId": trip_id}, user_id=other.id)
    assert result.data["deleteTravelHistory"]["success"] is False
    # Same message as a missing trip, so ids cannot be probed.
    assert result.data["deleteTravelHistory"]["message"] == "Trip not found."
    assert await session.get(TravelHistory, trip_id) is not None
