"""Travel history and the current user.

``getTravelHistory`` previously returned a hardcoded trip to Goa for every user,
regardless of who asked. The ``travel_history`` table it should have been reading
has existed all along.
"""

from __future__ import annotations

from typing import Annotated

import strawberry
from sqlmodel import select

from app.database.models import TravelHistory
from app.graphql.context import Info
from app.graphql.types.tourism_types import TravelHistory as TravelHistoryType
from app.graphql.types.tourism_types import User as UserType


@strawberry.type
class TravelQuery:
    @strawberry.field
    async def get_travel_history(
        self,
        info: Info,
        user_id: Annotated[
            int | None,
            strawberry.argument(
                deprecation_reason=(
                    "Ignored. History is read for the authenticated user; omit this argument."
                )
            ),
        ] = None,
    ) -> list[TravelHistoryType]:
        viewer = await info.context.user()
        if viewer is None:
            return []

        statement = (
            select(TravelHistory)
            .where(TravelHistory.user_id == viewer.id)
            .order_by(TravelHistory.visit_date.desc())  # type: ignore
        )
        async with info.context.db() as session:
            trips = (await session.exec(statement)).all()
        return [TravelHistoryType.from_model(trip) for trip in trips]

    @strawberry.field
    async def me(self, info: Info) -> UserType | None:
        """The authenticated user, or null when unauthenticated."""
        viewer = await info.context.user()
        return UserType.from_model(viewer) if viewer else None
