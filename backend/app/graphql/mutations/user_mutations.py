"""Travel history and user preference writes.

``addTravelHistory`` used to return a hardcoded ``id=1`` without touching the
database, and ``updateUserPreferences`` reported success without changing
anything. Both tables have existed all along.
"""

from __future__ import annotations

import json
from typing import Annotated

import strawberry

from app.database.models import TravelHistory, User, utcnow
from app.graphql.context import Info
from app.graphql.types.tourism_types import (
    AuthResponse,
    DeleteResponse,
    ProfileResponse,
    TravelHistoryInput,
)
from app.graphql.types.tourism_types import (
    TravelHistory as TravelHistoryType,
)
from app.graphql.types.tourism_types import (
    User as UserType,
)

LegacyUserId = Annotated[
    int | None,
    strawberry.argument(
        deprecation_reason=("Ignored. Derived from the authenticated user; omit this argument.")
    ),
]


@strawberry.type
class TravelMutation:
    @strawberry.mutation
    async def add_travel_history(
        self, info: Info, input: TravelHistoryInput, user_id: LegacyUserId = None
    ) -> TravelHistoryType | None:
        user = await info.context.user()
        if user is None:
            return None

        trip = TravelHistory(
            user_id=user.id,
            destination=input.destination,
            country=input.country,
            visit_date=input.visit_date or utcnow(),
            notes=input.notes,
            photos=json.dumps(input.photos) if input.photos else None,
            favorite_phrases=(
                json.dumps(input.favorite_phrases) if input.favorite_phrases else None
            ),
        )
        async with info.context.db() as session:
            session.add(trip)
            await session.commit()
            await session.refresh(trip)
            return TravelHistoryType.from_model(trip)


@strawberry.type
class UserMutation:
    @strawberry.mutation
    async def update_user_preferences(
        self,
        info: Info,
        preferred_language: str | None = None,
        preferred_theme: str | None = None,
        user_id: LegacyUserId = None,
    ) -> AuthResponse:
        user = await info.context.user()
        if user is None:
            return AuthResponse(
                success=False,
                message="Please sign in to update your preferences.",
                token=None,
                user=None,
            )

        if preferred_language is not None:
            user.preferred_language = preferred_language
        if preferred_theme is not None:
            user.preferred_theme = preferred_theme
        user.updated_at = utcnow()

        async with info.context.db() as session:
            session.add(user)
            await session.commit()
            await session.refresh(user)

            return AuthResponse(
                success=True,
                message="Preferences updated",
                token=None,
                user=UserType.from_model(user),
            )

    @strawberry.mutation
    async def update_profile(
        self,
        info: Info,
        full_name: str | None = None,
        home_country: str | None = None,
    ) -> ProfileResponse:
        """Save the account's personal details.

        The settings form has always shown these fields and reported success,
        but nothing persisted them - `updateUserPreferences` only ever handled
        language and theme.
        """
        user = await info.context.user()
        if user is None:
            return ProfileResponse(
                success=False, message="Please sign in to update your profile.", user=None
            )

        async with info.context.db() as session:
            current = await session.get(User, user.id)
            if current is None:  # pragma: no cover - defensive
                return ProfileResponse(success=False, message="Account not found.", user=None)

            if full_name is not None:
                # Empty string clears the field rather than storing whitespace.
                current.full_name = full_name.strip() or None
            if home_country is not None:
                current.home_country = home_country.strip() or None
            current.updated_at = utcnow()

            session.add(current)
            await session.commit()
            await session.refresh(current)
            saved = UserType.from_model(current)

        return ProfileResponse(success=True, message="Profile updated", user=saved)

    @strawberry.mutation
    async def delete_travel_history(self, info: Info, entry_id: int) -> DeleteResponse:
        """Remove a trip. There was no way to undo `addTravelHistory`."""
        user = await info.context.user()
        if user is None:
            return DeleteResponse(success=False, message="Please sign in.")

        async with info.context.db() as session:
            trip = await session.get(TravelHistory, entry_id)
            # Same message for "missing" and "not yours", so ids cannot be probed.
            if trip is None or trip.user_id != user.id:
                return DeleteResponse(success=False, message="Trip not found.")

            await session.delete(trip)
            await session.commit()

        return DeleteResponse(success=True, message="Trip removed")
