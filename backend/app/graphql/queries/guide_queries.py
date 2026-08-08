"""Emergency contacts and culture tips."""

from __future__ import annotations

import strawberry
from sqlalchemy import case
from sqlmodel import select

from app.database.models import CultureTip, EmergencyContact
from app.graphql.context import Info
from app.graphql.types.tourism_types import CultureTip as CultureTipType
from app.graphql.types.tourism_types import EmergencyContact as EmergencyContactType

# `importance` is a free-text column, so ordering by it descending sorted
# alphabetically - medium, low, high - the exact opposite of "high first".
IMPORTANCE_RANK = case(
    {"high": 0, "medium": 1, "low": 2},
    value=CultureTip.importance,
    else_=3,
)


@strawberry.type
class GuideQuery:
    @strawberry.field
    async def get_emergency_contacts(
        self, info: Info, country: str = "India"
    ) -> list[EmergencyContactType]:
        statement = select(EmergencyContact).where(
            EmergencyContact.country == country,
            EmergencyContact.is_active,
        )
        async with info.context.db() as session:
            contacts = (await session.exec(statement)).all()
        return [EmergencyContactType.from_model(contact) for contact in contacts]

    @strawberry.field
    async def get_culture_tips(
        self,
        info: Info,
        country: str = "India",
        language: str = "en",
        category: str | None = None,
        importance: str | None = None,
        limit: int = 50,
    ) -> list[CultureTipType]:
        statement = select(CultureTip).where(
            CultureTip.country == country,
            CultureTip.language == language,
        )
        if category:
            statement = statement.where(CultureTip.tip_category == category)
        if importance:
            statement = statement.where(CultureTip.importance == importance)

        statement = statement.order_by(IMPORTANCE_RANK, CultureTip.created_at.desc()).limit(limit)  # type: ignore
        async with info.context.db() as session:
            tips = (await session.exec(statement)).all()
        return [CultureTipType.from_model(tip) for tip in tips]
