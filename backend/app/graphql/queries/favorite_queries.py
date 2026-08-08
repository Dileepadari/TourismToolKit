"""Reads for saved places."""

from __future__ import annotations

import strawberry
from sqlmodel import select

from app.database.models import Place, PlaceFavorite
from app.graphql.context import Info
from app.graphql.types.tourism_types import Place as PlaceType


@strawberry.type
class FavoriteQuery:
    @strawberry.field
    async def get_favorite_places(self, info: Info) -> list[PlaceType]:
        """Places the caller has saved, newest first."""
        user = await info.context.user()
        if user is None:
            return []

        async with info.context.db() as session:
            statement = (
                select(Place)
                .join(PlaceFavorite, PlaceFavorite.place_id == Place.id)  # type: ignore[arg-type]
                .where(PlaceFavorite.user_id == user.id)
                .order_by(PlaceFavorite.created_at.desc())  # type: ignore
            )
            places = (await session.exec(statement)).all()
        return [PlaceType.from_model(place) for place in places]

    @strawberry.field
    async def get_favorite_place_ids(self, info: Info) -> list[int]:
        """Just the ids, so a list of cards can render its saved state in one call."""
        user = await info.context.user()
        if user is None:
            return []

        async with info.context.db() as session:
            rows = (
                await session.exec(
                    select(PlaceFavorite.place_id).where(PlaceFavorite.user_id == user.id)
                )
            ).all()
        return list(rows)
