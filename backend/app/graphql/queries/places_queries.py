from __future__ import annotations

import strawberry
from sqlmodel import or_, select

from app.database.models import Place
from app.graphql.context import Info
from app.graphql.types.tourism_types import Place as PlaceType


@strawberry.type
class PlacesQuery:
    @strawberry.field
    async def get_places(
        self,
        info: Info,
        country: str | None = None,
        state: str | None = None,
        city: str | None = None,
        category: str | None = None,
        limit: int = 50,
    ) -> list[PlaceType]:
        statement = select(Place)
        if country:
            statement = statement.where(Place.country == country)
        if state:
            statement = statement.where(Place.state == state)
        if city:
            statement = statement.where(Place.city == city)
        if category:
            statement = statement.where(Place.category == category)

        # nullslast so unrated places sort after rated ones rather than first.
        statement = statement.order_by(Place.rating.desc().nullslast()).limit(limit)  # type: ignore
        async with info.context.db() as session:
            places = (await session.exec(statement)).all()
        return [PlaceType.from_model(place) for place in places]

    @strawberry.field
    async def get_place_by_id(self, info: Info, place_id: int) -> PlaceType | None:
        async with info.context.db() as session:
            place = await session.get(Place, place_id)
        return PlaceType.from_model(place) if place else None

    @strawberry.field
    async def search_places(
        self, info: Info, search_query: str, limit: int = 20
    ) -> list[PlaceType]:
        pattern = f"%{search_query}%"
        statement = (
            select(Place)
            .where(
                or_(
                    Place.name.ilike(pattern),  # type: ignore
                    Place.description.ilike(pattern),  # type: ignore
                    Place.city.ilike(pattern),  # type: ignore
                    Place.state.ilike(pattern),  # type: ignore
                )
            )
            .limit(limit)
        )
        async with info.context.db() as session:
            places = (await session.exec(statement)).all()
        return [PlaceType.from_model(place) for place in places]
