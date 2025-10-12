"""
GraphQL queries for guide feature - emergency contacts and culture tips
"""
import strawberry
from typing import List, Optional
from sqlmodel import Session, select
from ..types.tourism_types import EmergencyContact as GraphQLEmergencyContact, CultureTip as GraphQLCultureTip
from ...database.db import engine
from ...database.models import EmergencyContact, CultureTip

@strawberry.field
def get_emergency_contacts(country: str = "India") -> List[GraphQLEmergencyContact]:
    """Get emergency contacts for a specific country"""
    with Session(engine) as session:
        statement = select(EmergencyContact).where(
            EmergencyContact.country == country,
            EmergencyContact.is_active == True
        )
        contacts = session.exec(statement).all()
        
        return [
            GraphQLEmergencyContact(
                id=contact.id,
                country=contact.country,
                service_type=contact.service_type,
                number=contact.number,
                description=contact.description
            )
            for contact in contacts
        ]

@strawberry.field
def get_culture_tips(
    country: str = "India",
    language: str = "en",
    category: Optional[str] = None,
    importance: Optional[str] = None,
    limit: int = 50
) -> List[GraphQLCultureTip]:
    """Get culture tips for a specific country"""
    with Session(engine) as session:
        statement = select(CultureTip).where(
            CultureTip.country == country,
            CultureTip.language == language
        )
        
        # Apply optional filters
        if category:
            statement = statement.where(CultureTip.tip_category == category)
        
        if importance:
            statement = statement.where(CultureTip.importance == importance)
        
        # Order by importance (high first) and limit
        statement = statement.order_by(
            CultureTip.importance.desc(),
            CultureTip.created_at.desc()
        ).limit(limit)
        
        tips = session.exec(statement).all()
        
        return [
            GraphQLCultureTip(
                id=tip.id,
                country=tip.country,
                tip_category=tip.tip_category,
                tip_text=tip.tip_text,
                language=tip.language
            )
            for tip in tips
        ]

# Export queries
GuideQueries = [get_emergency_contacts, get_culture_tips]
