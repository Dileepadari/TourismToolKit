"""Place favourites.

The Heart button on a place card had no handler at all - there was no table, no
mutation and no query behind it.
"""

from __future__ import annotations

import logging

import strawberry
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.database.models import Place, PlaceFavorite
from app.graphql.context import Info
from app.graphql.types.tourism_types import FavoriteResponse

logger = logging.getLogger(__name__)


@strawberry.type
class PlaceMutation:
    @strawberry.mutation
    async def toggle_favorite_place(self, info: Info, place_id: int) -> FavoriteResponse:
        """Add or remove a place from the caller's favourites."""
        user = await info.context.user()
        if user is None:
            return FavoriteResponse(
                success=False, message="Please sign in to save places.", is_favorite=False
            )

        async with info.context.db() as session:
            place = await session.get(Place, place_id)
            if place is None:
                return FavoriteResponse(
                    success=False, message="Place not found.", is_favorite=False
                )

            existing = (
                await session.exec(
                    select(PlaceFavorite).where(
                        PlaceFavorite.user_id == user.id,
                        PlaceFavorite.place_id == place_id,
                    )
                )
            ).first()

            if existing is not None:
                await session.delete(existing)
                await session.commit()
                return FavoriteResponse(
                    success=True,
                    message=f"Removed {place.name} from saved places",
                    is_favorite=False,
                )

            session.add(PlaceFavorite(user_id=user.id, place_id=place_id))
            try:
                await session.commit()
            except IntegrityError:
                # Double-click or a concurrent request; the unique constraint
                # caught it, and the desired end state is already reached.
                await session.rollback()

            return FavoriteResponse(success=True, message=f"Saved {place.name}", is_favorite=True)
