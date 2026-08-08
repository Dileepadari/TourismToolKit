"""Root schema assembly.

The previous version concatenated lists of bare resolver functions into
``strawberry.tools.create_type``. That builds a class namespace dict, so a field
defined twice was silently resolved by *concatenation order* - which is how a
mock ``register`` came to shadow the real one, and how ``login``/``register``
ended up on the Query type as well as the Mutation type.

``_merge`` makes that class of bug a startup error instead.
"""

from __future__ import annotations

import strawberry
from graphql import GraphQLError
from graphql.validation import NoSchemaIntrospectionCustomRule
from strawberry.extensions import AddValidationRules, MaskErrors, MaxTokensLimiter

from app.core.config import get_settings
from app.graphql.extensions import QueryCostLimiter, RateLimiter
from app.graphql.mutations.ai_mutations import (
    ASRMutation,
    MTMutation,
    OCRMutation,
    TTSMutation,
)
from app.graphql.mutations.auth_mutations import AuthMutation
from app.graphql.mutations.dictionary_mutations import DictionaryMutation
from app.graphql.mutations.place_mutations import PlaceMutation
from app.graphql.mutations.user_mutations import TravelMutation, UserMutation
from app.graphql.queries.dictionary_queries import DictionaryQuery
from app.graphql.queries.favorite_queries import FavoriteQuery
from app.graphql.queries.guide_queries import GuideQuery
from app.graphql.queries.language_queries import LanguageQuery
from app.graphql.queries.phrases_queries import PhrasesQuery
from app.graphql.queries.places_queries import PlacesQuery
from app.graphql.queries.session_queries import SessionQuery
from app.graphql.queries.travel_queries import TravelQuery


def _merge(name: str, *bases: type) -> type:
    """Combine domain types into a root type, refusing duplicate fields.

    Plain inheritance would resolve a collision silently via the MRO - the same
    failure mode this replaces - so the check is explicit.
    """
    seen: dict[str, type] = {}
    for base in bases:
        for field in base.__strawberry_definition__.fields:  # type: ignore[attr-defined]
            if field.name in seen:
                raise TypeError(
                    f"duplicate GraphQL field {field.name!r}: "
                    f"defined in both {seen[field.name].__name__} and {base.__name__}"
                )
            seen[field.name] = base
    return strawberry.type(type(name, bases, {}))


Query = _merge(
    "Query",
    DictionaryQuery,
    PlacesQuery,
    FavoriteQuery,
    SessionQuery,
    GuideQuery,
    LanguageQuery,
    PhrasesQuery,
    TravelQuery,
)

Mutation = _merge(
    "Mutation",
    AuthMutation,
    DictionaryMutation,
    PlaceMutation,
    TravelMutation,
    UserMutation,
    TTSMutation,
    MTMutation,
    OCRMutation,
    ASRMutation,
)

_settings = get_settings()

# Errors raised on purpose by our own extensions, safe to show the caller.
_INTENTIONAL_ERROR_MARKERS = (
    "Too many requests",
    "too deeply nested",
    "too many aliases",
)


def _should_mask(error: GraphQLError) -> bool:
    # Errors our own extensions raise carry no `original_error` and a message we
    # wrote, so they are safe - and useful - to show the caller as-is.
    deliberate = error.original_error is None and any(
        marker in (error.message or "") for marker in _INTENTIONAL_ERROR_MARKERS
    )
    return not deliberate


# Factories, not instances: strawberry constructs a fresh extension per request,
# and passing pre-built instances is deprecated.
_extensions: list[object] = [
    # Resolvers used to stringify exceptions into user-visible `message` fields,
    # which leaked database errors and upstream URLs to any caller.
    # Mask *unexpected* errors only. Rate-limit and query-cost rejections are
    # deliberate, actionable messages - replacing them with "Unexpected error."
    # would leave the caller with no idea what to change.
    lambda: MaskErrors(should_mask_error=_should_mask),
    lambda: MaxTokensLimiter(max_token_count=4000),
    # MaxTokensLimiter caps document size; these cap its shape and frequency.
    QueryCostLimiter,
    RateLimiter,
]
if _settings.is_production:
    # An introspectable schema in production is a free map of the API.
    _extensions.append(lambda: AddValidationRules([NoSchemaIntrospectionCustomRule]))

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=_extensions,  # type: ignore[arg-type]
)
