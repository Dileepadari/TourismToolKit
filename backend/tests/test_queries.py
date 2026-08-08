"""Read paths: dictionary scoping, places, guide, phrases, languages."""

from __future__ import annotations

import json

import pytest

from app.database.models import CultureTip, DictionaryEntry, EmergencyContact, Place, User

ENTRIES = """
query Entries($searchWord: String, $languageFrom: String, $isFavorite: Boolean) {
  getDictionaryEntries(searchWord: $searchWord, languageFrom: $languageFrom, isFavorite: $isFavorite) {
    id word translation tags
  }
}
"""

SEARCH = """
query Search($query: String!) {
  searchDictionary(query: $query, languageFrom: "en", languageTo: "hi") { id word }
}
"""

USER_DICTIONARY = "{ getUserDictionary { id word } }"
PLACES = """
query Places($country: String, $category: String) {
  getPlaces(country: $country, category: $category) { id name images languagesSpoken rating }
}
"""
SEARCH_PLACES = "query S($q: String!) { searchPlaces(searchQuery: $q) { id name } }"
CULTURE = '{ getCultureTips(country: "India") { id tipCategory tipText } }'
CONTACTS = '{ getEmergencyContacts(country: "India") { id serviceType number } }'


@pytest.fixture
async def system_user(session) -> User:
    from app.services import auth

    user = await auth.create_user(
        session,
        email="system@tourismtoolkit.com",
        username="system",
        password="unused-placeholder-1",
    )
    return user


@pytest.fixture
async def public_entry(session, system_user) -> DictionaryEntry:
    entry = DictionaryEntry(
        user_id=system_user.id,
        word="hello",
        translation="नमस्ते",
        language_from="en",
        language_to="hi",
        tags="greeting",
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    return entry


# --- Dictionary scoping -----------------------------------------------------


async def test_anonymous_callers_see_only_the_public_dictionary(execute, public_entry):
    result = await execute(ENTRIES)
    words = [e["word"] for e in result.data["getDictionaryEntries"]]
    assert "hello" in words


async def test_authenticated_callers_see_public_plus_their_own(
    execute, make_user, public_entry, session
):
    user = await make_user()
    session.add(
        DictionaryEntry(
            user_id=user.id,
            word="water",
            translation="पानी",
            language_from="en",
            language_to="hi",
        )
    )
    await session.commit()

    result = await execute(ENTRIES, user_id=user.id)
    words = {e["word"] for e in result.data["getDictionaryEntries"]}
    assert {"hello", "water"} <= words


async def test_one_users_entries_are_invisible_to_another(
    execute, make_user, public_entry, session
):
    owner = await make_user(email="owner@x.com", username="owner")
    other = await make_user(email="other@x.com", username="other")
    session.add(
        DictionaryEntry(
            user_id=owner.id,
            word="private",
            translation="निजी",
            language_from="en",
            language_to="hi",
        )
    )
    await session.commit()

    result = await execute(ENTRIES, user_id=other.id)
    words = {e["word"] for e in result.data["getDictionaryEntries"]}
    assert "private" not in words
    assert "hello" in words  # public entries still visible


async def test_get_user_dictionary_returns_only_your_own(execute, make_user, public_entry, session):
    user = await make_user()
    session.add(
        DictionaryEntry(
            user_id=user.id, word="mine", translation="मेरा", language_from="en", language_to="hi"
        )
    )
    await session.commit()

    result = await execute(USER_DICTIONARY, user_id=user.id)
    words = {e["word"] for e in result.data["getUserDictionary"]}
    assert words == {"mine"}


async def test_get_user_dictionary_is_empty_when_anonymous(execute, public_entry):
    result = await execute(USER_DICTIONARY)
    assert result.data["getUserDictionary"] == []


async def test_search_is_case_insensitive(execute, public_entry):
    result = await execute(SEARCH, {"query": "HELLO"})
    assert [e["word"] for e in result.data["searchDictionary"]] == ["hello"]


async def test_tags_are_split_into_a_list(execute, public_entry):
    result = await execute(ENTRIES)
    entry = next(e for e in result.data["getDictionaryEntries"] if e["word"] == "hello")
    assert entry["tags"] == ["greeting"]


async def test_language_filter_applies(execute, public_entry):
    assert await execute(ENTRIES, {"languageFrom": "en"}) is not None
    empty = await execute(ENTRIES, {"languageFrom": "fr"})
    assert empty.data["getDictionaryEntries"] == []


# --- Places -----------------------------------------------------------------


@pytest.fixture
async def places(session) -> None:
    session.add_all(
        [
            Place(
                name="Taj Mahal",
                country="India",
                city="Agra",
                category="heritage",
                rating=4.8,
                images=json.dumps(["https://example.test/taj.jpg"]),
                languages_spoken=json.dumps(["hi", "en"]),
            ),
            Place(name="Unrated Fort", country="India", city="Delhi", category="heritage"),
            Place(name="Malformed", country="India", city="Goa", images="{not json"),
        ]
    )
    await session.commit()


async def test_places_decode_json_columns(execute, places):
    result = await execute(PLACES, {"country": "India"})
    taj = next(p for p in result.data["getPlaces"] if p["name"] == "Taj Mahal")
    assert taj["images"] == ["https://example.test/taj.jpg"]
    assert taj["languagesSpoken"] == ["hi", "en"]


async def test_a_malformed_json_column_does_not_break_the_resolver(execute, places):
    """One bad row used to take out the whole query - json.loads was unguarded."""
    result = await execute(PLACES, {"country": "India"})
    assert result.errors is None
    bad = next(p for p in result.data["getPlaces"] if p["name"] == "Malformed")
    assert bad["images"] == []


async def test_unrated_places_sort_after_rated_ones(execute, places):
    result = await execute(PLACES, {"country": "India"})
    ratings = [p["rating"] for p in result.data["getPlaces"]]
    assert ratings[0] == 4.8
    assert ratings[-1] is None


async def test_search_places_matches_city(execute, places):
    result = await execute(SEARCH_PLACES, {"q": "agra"})
    assert [p["name"] for p in result.data["searchPlaces"]] == ["Taj Mahal"]


# --- Guide ------------------------------------------------------------------


async def test_culture_tips_sort_high_importance_first(execute, session):
    session.add_all(
        [
            CultureTip(country="India", tip_category="food", tip_text="low one", importance="low"),
            CultureTip(
                country="India", tip_category="food", tip_text="high one", importance="high"
            ),
            CultureTip(
                country="India", tip_category="food", tip_text="medium one", importance="medium"
            ),
        ]
    )
    await session.commit()

    result = await execute(CULTURE)
    texts = [t["tipText"] for t in result.data["getCultureTips"]]
    # Ordering by the raw string descending gave medium, low, high.
    assert texts == ["high one", "medium one", "low one"]


async def test_inactive_emergency_contacts_are_hidden(execute, session):
    session.add_all(
        [
            EmergencyContact(country="India", service_type="police", number="100", is_active=True),
            EmergencyContact(country="India", service_type="old", number="999", is_active=False),
        ]
    )
    await session.commit()

    result = await execute(CONTACTS)
    numbers = {c["number"] for c in result.data["getEmergencyContacts"]}
    assert numbers == {"100"}


# --- Languages and phrases --------------------------------------------------


async def test_get_supported_languages_returns_the_wrapper_shape(execute):
    result = await execute("{ getSupportedLanguages { languages { code name } } }")
    languages = result.data["getSupportedLanguages"]["languages"]
    assert {"code": "en", "name": "English"} in languages
    assert len(languages) >= 10


@pytest.mark.parametrize(
    ("field", "wrapped"),
    [
        ("supportedLanguages", False),
        ("supportedMtLanguages", False),
        ("supportedAsrLanguages", False),
        ("supportedOcrLanguages", True),
    ],
)
async def test_per_service_language_fields_keep_their_shapes(execute, field, wrapped):
    """The shapes are inconsistent, but they match the frontend's documents."""
    selection = "{ languages { code } }" if wrapped else "{ code }"
    result = await execute(f"{{ {field} {selection} }}")
    assert result.errors is None
    payload = result.data[field]
    assert payload["languages"] if wrapped else payload


@pytest.mark.parametrize("language", ["en", "hi", "te", "zz"])
async def test_phrases_always_return_something(execute, language):
    """These used to call an undefined `TourismService` and raise NameError."""
    result = await execute(
        "query P($l: String!) { getCommonPhrases(language: $l) { phrases { phrase category } } }",
        {"l": language},
    )
    assert result.errors is None
    assert len(result.data["getCommonPhrases"]["phrases"]) >= 5


async def test_emergency_phrases_are_available(execute):
    result = await execute(
        '{ getEmergencyPhrases(language: "hi") { phrases { phrase category } } }'
    )
    assert result.errors is None
    assert result.data["getEmergencyPhrases"]["phrases"]
