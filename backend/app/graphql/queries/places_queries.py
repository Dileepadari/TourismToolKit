import strawberry
from typing import List, Optional
from sqlmodel import Session, select
from ..types.tourism_types import Place as GraphQLPlace
from ...database.db import get_engine
from ...database.models import Place
import json

@strawberry.field
def get_places(
    self,
    country: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
) -> List[GraphQLPlace]:
    """
    Get places with optional filters
    """
    engine = get_engine()
    with Session(engine) as session:
        # Build query
        statement = select(Place)
        
        # Apply filters
        if country:
            statement = statement.where(Place.country == country)
        
        if state:
            statement = statement.where(Place.state == state)
            
        if city:
            statement = statement.where(Place.city == city)
        
        if category:
            statement = statement.where(Place.category == category)
        
        # Order by rating
        statement = statement.order_by(Place.rating.desc())
        
        # Limit results
        statement = statement.limit(limit)
        
        places = session.exec(statement).all()
        
        # Convert to GraphQL type
        return [
            GraphQLPlace(
                id=place.id,
                name=place.name,
                description=place.description,
                country=place.country,
                state=place.state,
                city=place.city,
                latitude=place.latitude,
                longitude=place.longitude,
                category=place.category,
                images=json.loads(place.images) if place.images else [],
                languages_spoken=json.loads(place.languages_spoken) if place.languages_spoken else [],
                best_time_to_visit=place.best_time_to_visit,
                entry_fee=place.entry_fee,
                rating=place.rating
            )
            for place in places
        ]

@strawberry.field
def get_place_by_id(self, place_id: int) -> Optional[GraphQLPlace]:
    """Get a specific place by ID"""
    engine = get_engine()
    with Session(engine) as session:
        place = session.get(Place, place_id)
        
        if not place:
            return None
        
        return GraphQLPlace(
            id=place.id,
            name=place.name,
            description=place.description,
            country=place.country,
            state=place.state,
            city=place.city,
            latitude=place.latitude,
            longitude=place.longitude,
            category=place.category,
            images=json.loads(place.images) if place.images else [],
            languages_spoken=json.loads(place.languages_spoken) if place.languages_spoken else [],
            best_time_to_visit=place.best_time_to_visit,
            entry_fee=place.entry_fee,
            rating=place.rating
        )

@strawberry.field
def search_places(self, search_query: str, limit: int = 20) -> List[GraphQLPlace]:
    """Search places by name, description, or city"""
    engine = get_engine()
    with Session(engine) as session:
        statement = select(Place).where(
            (Place.name.ilike(f"%{search_query}%")) |
            (Place.description.ilike(f"%{search_query}%")) |
            (Place.city.ilike(f"%{search_query}%")) |
            (Place.state.ilike(f"%{search_query}%"))
        ).limit(limit)
        
        places = session.exec(statement).all()
        
        return [
            GraphQLPlace(
                id=place.id,
                name=place.name,
                description=place.description,
                country=place.country,
                state=place.state,
                city=place.city,
                latitude=place.latitude,
                longitude=place.longitude,
                category=place.category,
                images=json.loads(place.images) if place.images else [],
                languages_spoken=json.loads(place.languages_spoken) if place.languages_spoken else [],
                best_time_to_visit=place.best_time_to_visit,
                entry_fee=place.entry_fee,
                rating=place.rating
            )
            for place in places
        ]

PlacesQueries = [get_places, get_place_by_id, search_places]
