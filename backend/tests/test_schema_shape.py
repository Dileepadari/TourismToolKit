"""Structural guarantees about the schema.

The previous assembly concatenated lists of resolver functions into
`strawberry.tools.create_type`, which resolves duplicate field names silently by
*concatenation order*. That is how a mock `register` came to shadow the real one,
and how `login`/`register` ended up on the Query type as well as Mutation.
"""

from __future__ import annotations

import pytest
import strawberry

from app.graphql.schema import _merge, schema


def graphql_schema():
    """The underlying graphql-core schema strawberry wraps."""
    return schema._schema


def field_names(type_name: str) -> set[str]:
    graphql_type = graphql_schema().type_map[type_name]
    return set(graphql_type.fields)  # type: ignore[union-attr]


def test_merge_rejects_duplicate_fields():
    @strawberry.type
    class A:
        @strawberry.field
        def shared(self) -> str:
            return "a"

    @strawberry.type
    class B:
        @strawberry.field
        def shared(self) -> str:
            return "b"

    with pytest.raises(TypeError, match="duplicate GraphQL field 'shared'"):
        _merge("Root", A, B)


def test_merge_accepts_disjoint_types():
    @strawberry.type
    class A:
        @strawberry.field
        def alpha(self) -> str:
            return "a"

    @strawberry.type
    class B:
        @strawberry.field
        def beta(self) -> str:
            return "b"

    assert _merge("Root", A, B) is not None


def test_auth_fields_live_only_on_mutation():
    """They used to be on both, which allowed `query { login }`."""
    assert {"login", "register"} <= field_names("Mutation")
    assert not ({"login", "register"} & field_names("Query"))


def test_get_supported_languages_exists():
    """The frontend has queried this since the settings page was written."""
    assert "getSupportedLanguages" in field_names("Query")


@pytest.mark.parametrize(
    "field",
    [
        "getDictionaryEntries",
        "searchDictionary",
        "getDictionaryEntry",
        "getUserDictionary",
        "getPlaces",
        "getPlaceById",
        "searchPlaces",
        "getEmergencyContacts",
        "getCultureTips",
        "getCommonPhrases",
        "getEmergencyPhrases",
        "getTravelHistory",
        "supportedLanguages",
        "supportedMtLanguages",
        "supportedAsrLanguages",
        "supportedOcrLanguages",
        "me",
    ],
)
def test_query_fields_present(field: str):
    assert field in field_names("Query")


@pytest.mark.parametrize(
    "field",
    [
        "register",
        "login",
        "addDictionaryEntry",
        "updateDictionaryEntry",
        "deleteDictionaryEntry",
        "toggleFavoriteEntry",
        "addTravelHistory",
        "updateUserPreferences",
        "generateSpeech",
        "translateText",
        "extractTextFromImage",
        "transcribeAudio",
    ],
)
def test_mutation_fields_present(field: str):
    assert field in field_names("Mutation")


def test_colliding_type_names_are_gone():
    """`Language`/`LanguagesResponse` had two-to-three definitions each."""
    type_map = graphql_schema().type_map
    for removed in ("LanguageTts", "OCRLanguage", "OCRLanguagesResponse", "ApiUrlResponse"):
        assert removed not in type_map, f"{removed} should have been consolidated away"
    assert "Language" in type_map
    assert "LanguagesResponse" in type_map


def test_legacy_user_id_arguments_are_nullable_and_deprecated():
    """`Int!` -> `Int` is safe for existing clients; the deprecation flags intent."""
    mutation = graphql_schema().type_map["Mutation"]
    for field_name in (
        "addDictionaryEntry",
        "updateDictionaryEntry",
        "deleteDictionaryEntry",
        "toggleFavoriteEntry",
    ):
        argument = mutation.fields[field_name].args["userId"]  # type: ignore[union-attr]
        assert str(argument.type) == "Int", f"{field_name}.userId must be nullable"
        assert argument.deprecation_reason
