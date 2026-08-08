"""Dictionary writes.

Every one of these took ``user_id: Int!`` straight from the client and then
"verified ownership" by comparing that value against itself, so any caller could
read, edit and delete any other user's entries. Identity now comes from the
bearer token; the argument is accepted-and-ignored for one release so existing
frontend documents keep validating.
"""

from __future__ import annotations

import logging
from typing import Annotated

import strawberry

from app.database.models import DictionaryEntry, utcnow
from app.graphql.context import Info
from app.graphql.types.tourism_types import DictionaryEntry as DictionaryEntryType
from app.graphql.types.tourism_types import DictionaryInput, DictionaryResponse

logger = logging.getLogger(__name__)

NOT_SIGNED_IN = "Please sign in to manage your dictionary."
# Deliberately identical for "no such entry" and "not yours": distinguishing them
# lets a caller probe which entry ids exist.
NOT_FOUND = "Dictionary entry not found."

LegacyUserId = Annotated[
    int | None,
    strawberry.argument(
        deprecation_reason=(
            "Ignored. The entry owner is derived from the authenticated user; omit this argument."
        )
    ),
]


def _note_ignored(supplied: int | None, actual: int | None) -> None:
    if supplied is not None and supplied != actual:
        logger.warning(
            "ignoring client-supplied user_id=%s for authenticated user id=%s",
            supplied,
            actual,
        )


@strawberry.type
class DictionaryMutation:
    @strawberry.mutation
    async def add_dictionary_entry(
        self, info: Info, input: DictionaryInput, user_id: LegacyUserId = None
    ) -> DictionaryResponse:
        user = await info.context.user()
        if user is None:
            return DictionaryResponse.failure(NOT_SIGNED_IN)
        _note_ignored(user_id, user.id)

        entry = DictionaryEntry(
            user_id=user.id,
            word=input.word,
            translation=input.translation,
            language_from=input.language_from,
            language_to=input.language_to,
            pronunciation=input.pronunciation,
            usage_example=input.usage_example,
            tags=",".join(input.tags) if input.tags else None,
            is_favorite=input.is_favorite,
        )
        async with info.context.db() as session:
            session.add(entry)
            await session.commit()
            await session.refresh(entry)

            return DictionaryResponse(
                success=True,
                message="Dictionary entry added successfully",
                entry=DictionaryEntryType.from_model(entry),
            )

    @strawberry.mutation
    async def update_dictionary_entry(
        self,
        info: Info,
        entry_id: int,
        input: DictionaryInput,
        user_id: LegacyUserId = None,
    ) -> DictionaryResponse:
        user = await info.context.user()
        if user is None:
            return DictionaryResponse.failure(NOT_SIGNED_IN)
        _note_ignored(user_id, user.id)

        async with info.context.db() as session:
            entry = await session.get(DictionaryEntry, entry_id)
            if entry is None or entry.user_id != user.id:
                return DictionaryResponse.failure(NOT_FOUND)

            entry.word = input.word
            entry.translation = input.translation
            entry.language_from = input.language_from
            entry.language_to = input.language_to
            entry.pronunciation = input.pronunciation
            entry.usage_example = input.usage_example
            entry.tags = ",".join(input.tags) if input.tags else None
            entry.is_favorite = input.is_favorite
            entry.updated_at = utcnow()

            session.add(entry)
            await session.commit()
            await session.refresh(entry)

            return DictionaryResponse(
                success=True,
                message="Dictionary entry updated successfully",
                entry=DictionaryEntryType.from_model(entry),
            )

    @strawberry.mutation
    async def delete_dictionary_entry(
        self, info: Info, entry_id: int, user_id: LegacyUserId = None
    ) -> DictionaryResponse:
        user = await info.context.user()
        if user is None:
            return DictionaryResponse.failure(NOT_SIGNED_IN)
        _note_ignored(user_id, user.id)

        async with info.context.db() as session:
            entry = await session.get(DictionaryEntry, entry_id)
            if entry is None or entry.user_id != user.id:
                return DictionaryResponse.failure(NOT_FOUND)

            await session.delete(entry)
            await session.commit()
            return DictionaryResponse(
                success=True, message="Dictionary entry deleted successfully", entry=None
            )

    @strawberry.mutation
    async def toggle_favorite_entry(
        self, info: Info, entry_id: int, user_id: LegacyUserId = None
    ) -> DictionaryResponse:
        user = await info.context.user()
        if user is None:
            return DictionaryResponse.failure(NOT_SIGNED_IN)
        _note_ignored(user_id, user.id)

        async with info.context.db() as session:
            entry = await session.get(DictionaryEntry, entry_id)
            if entry is None or entry.user_id != user.id:
                return DictionaryResponse.failure(NOT_FOUND)

            entry.is_favorite = not entry.is_favorite
            entry.updated_at = utcnow()
            session.add(entry)
            await session.commit()
            await session.refresh(entry)

            state = "added to" if entry.is_favorite else "removed from"
            return DictionaryResponse(
                success=True,
                message=f"Entry {state} favorites",
                entry=DictionaryEntryType.from_model(entry),
            )
