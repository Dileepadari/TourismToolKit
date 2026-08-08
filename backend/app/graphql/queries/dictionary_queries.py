"""Dictionary reads.

``userId`` is retained on these *queries* because it carries real meaning here -
it selects whose dictionary to read, and omitting it deliberately means "the
public/system dictionary". Unlike the mutations, though, the client's value is no
longer trusted: scope is derived from the bearer token.
"""

from __future__ import annotations

from typing import Annotated

import strawberry
from sqlmodel import or_, select

from app.database.models import DictionaryEntry, User
from app.graphql.context import Info
from app.graphql.types.tourism_types import DictionaryEntry as DictionaryEntryType

SYSTEM_USER_EMAIL = "system@tourismtoolkit.com"

_IGNORED_USER_ID = strawberry.argument(
    deprecation_reason=(
        "Ignored. The dictionary scope is derived from the authenticated user; omit this argument."
    )
)


async def _system_user_id(info: Info) -> int | None:
    async with info.context.db() as session:
        user = (await session.exec(select(User).where(User.email == SYSTEM_USER_EMAIL))).first()
    return user.id if user else None


@strawberry.type
class DictionaryQuery:
    @strawberry.field
    async def get_dictionary_entries(
        self,
        info: Info,
        language_from: str | None = None,
        language_to: str | None = None,
        search_word: str | None = None,
        user_id: Annotated[int | None, _IGNORED_USER_ID] = None,
        is_favorite: bool | None = None,
        limit: int = 100,
    ) -> list[DictionaryEntryType]:
        """Entries visible to the caller: their own plus the public dictionary."""
        viewer = await info.context.user()
        system_id = await _system_user_id(info)

        owners = [owner for owner in (viewer.id if viewer else None, system_id) if owner]
        if not owners:
            return []

        statement = select(DictionaryEntry).where(DictionaryEntry.user_id.in_(owners))  # type: ignore

        if language_from:
            statement = statement.where(DictionaryEntry.language_from == language_from)
        if language_to:
            statement = statement.where(DictionaryEntry.language_to == language_to)
        if search_word:
            statement = statement.where(DictionaryEntry.word.ilike(f"%{search_word}%"))  # type: ignore
        if is_favorite is not None:
            statement = statement.where(DictionaryEntry.is_favorite == is_favorite)

        async with info.context.db() as session:
            entries = (await session.exec(statement.limit(limit))).all()
        return [DictionaryEntryType.from_model(entry) for entry in entries]

    @strawberry.field
    async def search_dictionary(
        self,
        info: Info,
        query: str,
        language_from: str = "en",
        language_to: str = "hi",
        user_id: Annotated[int | None, _IGNORED_USER_ID] = None,
    ) -> list[DictionaryEntryType]:
        viewer = await info.context.user()
        system_id = await _system_user_id(info)

        owners = [owner for owner in (viewer.id if viewer else None, system_id) if owner]
        if not owners:
            return []

        statement = (
            select(DictionaryEntry)
            .where(DictionaryEntry.user_id.in_(owners))  # type: ignore
            .where(DictionaryEntry.language_from == language_from)
            .where(DictionaryEntry.language_to == language_to)
            .where(
                or_(
                    DictionaryEntry.word.ilike(f"%{query}%"),  # type: ignore
                    DictionaryEntry.translation.ilike(f"%{query}%"),  # type: ignore
                )
            )
            .limit(50)
        )
        async with info.context.db() as session:
            entries = (await session.exec(statement)).all()
        return [DictionaryEntryType.from_model(entry) for entry in entries]

    @strawberry.field
    async def get_dictionary_entry(self, info: Info, entry_id: int) -> DictionaryEntryType | None:
        async with info.context.db() as session:
            entry = await session.get(DictionaryEntry, entry_id)
        if entry is None:
            return None

        # Only the owner or the public dictionary is readable - the previous
        # version returned any entry by id.
        viewer = await info.context.user()
        system_id = await _system_user_id(info)
        if entry.user_id not in {viewer.id if viewer else None, system_id}:
            return None
        return DictionaryEntryType.from_model(entry)

    @strawberry.field
    async def get_user_dictionary(
        self,
        info: Info,
        user_id: Annotated[int | None, _IGNORED_USER_ID] = None,
        language_from: str | None = None,
        language_to: str | None = None,
    ) -> list[DictionaryEntryType]:
        """The signed-in user's own entries.

        Previously delegated to a ``TourismService`` that was never defined
        anywhere, so this raised ``NameError`` and the dashboard silently
        rendered an empty dictionary.
        """
        viewer = await info.context.user()
        if viewer is None:
            return []

        statement = select(DictionaryEntry).where(DictionaryEntry.user_id == viewer.id)
        if language_from:
            statement = statement.where(DictionaryEntry.language_from == language_from)
        if language_to:
            statement = statement.where(DictionaryEntry.language_to == language_to)

        async with info.context.db() as session:
            entries = (await session.exec(statement)).all()
        return [DictionaryEntryType.from_model(entry) for entry in entries]
