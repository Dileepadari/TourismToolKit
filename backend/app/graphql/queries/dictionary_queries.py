import strawberry
from typing import List, Optional
from sqlmodel import Session, select
from ..types.tourism_types import DictionaryEntry as GraphQLDictionaryEntry
from ...database.db import get_engine
from ...database.models import DictionaryEntry, User

@strawberry.field
def get_dictionary_entries(
    self,
    language_from: Optional[str] = None,
    language_to: Optional[str] = None,
    search_word: Optional[str] = None,
    user_id: Optional[int] = None,
    is_favorite: Optional[bool] = None,
    limit: int = 100
) -> List[GraphQLDictionaryEntry]:
    """
    Get dictionary entries with optional filters.
    If user_id is not provided, returns public/system dictionary entries.
    """
    engine = get_engine()
    with Session(engine) as session:
        # Build query
        statement = select(DictionaryEntry)
        
        # Filter by user or get system entries
        if user_id:
            statement = statement.where(DictionaryEntry.user_id == user_id)
        else:
            # Get system user entries (public dictionary)
            system_user = session.exec(
                select(User).where(User.email == "system@tourismtoolkit.com")
            ).first()
            if system_user:
                statement = statement.where(DictionaryEntry.user_id == system_user.id)
        
        # Apply filters
        if language_from:
            statement = statement.where(DictionaryEntry.language_from == language_from)
        
        if language_to:
            statement = statement.where(DictionaryEntry.language_to == language_to)
        
        if search_word:
            statement = statement.where(
                DictionaryEntry.word.ilike(f"%{search_word}%")
            )
        
        if is_favorite is not None:
            statement = statement.where(DictionaryEntry.is_favorite == is_favorite)
        
        # Limit results
        statement = statement.limit(limit)
        
        entries = session.exec(statement).all()
        
        # Convert to GraphQL types
        return [
            GraphQLDictionaryEntry(
                id=entry.id,
                word=entry.word,
                translation=entry.translation,
                language_from=entry.language_from,
                language_to=entry.language_to,
                pronunciation=entry.pronunciation,
                usage_example=entry.usage_example,
                tags=entry.tags.split(",") if entry.tags else None,
                is_favorite=entry.is_favorite,
                created_at=entry.created_at
            )
            for entry in entries
        ]

@strawberry.field
def search_dictionary(
    self,
    query: str,
    language_from: str = "en",
    language_to: str = "hi",
    user_id: Optional[int] = None
) -> List[GraphQLDictionaryEntry]:
    """
    Search dictionary entries by word or translation
    """
    engine = get_engine()
    with Session(engine) as session:
        statement = select(DictionaryEntry).where(
            (DictionaryEntry.language_from == language_from) &
            (DictionaryEntry.language_to == language_to) &
            (
                DictionaryEntry.word.ilike(f"%{query}%") |
                DictionaryEntry.translation.ilike(f"%{query}%")
            )
        )
        
        if user_id:
            # Search in both user's personal dictionary and system dictionary
            system_user = session.exec(
                select(User).where(User.email == "system@tourismtoolkit.com")
            ).first()
            if system_user:
                statement = statement.where(
                    (DictionaryEntry.user_id == user_id) |
                    (DictionaryEntry.user_id == system_user.id)
                )
        else:
            # Only system entries
            system_user = session.exec(
                select(User).where(User.email == "system@tourismtoolkit.com")
            ).first()
            if system_user:
                statement = statement.where(DictionaryEntry.user_id == system_user.id)
        
        statement = statement.limit(50)
        entries = session.exec(statement).all()
        
        return [
            GraphQLDictionaryEntry(
                id=entry.id,
                word=entry.word,
                translation=entry.translation,
                language_from=entry.language_from,
                language_to=entry.language_to,
                pronunciation=entry.pronunciation,
                usage_example=entry.usage_example,
                tags=entry.tags.split(",") if entry.tags else None,
                is_favorite=entry.is_favorite,
                created_at=entry.created_at
            )
            for entry in entries
        ]

@strawberry.field
def get_dictionary_entry(self, entry_id: int) -> Optional[GraphQLDictionaryEntry]:
    """Get a specific dictionary entry by ID"""
    engine = get_engine()
    with Session(engine) as session:
        entry = session.get(DictionaryEntry, entry_id)
        
        if not entry:
            return None
        
        return GraphQLDictionaryEntry(
            id=entry.id,
            word=entry.word,
            translation=entry.translation,
            language_from=entry.language_from,
            language_to=entry.language_to,
            pronunciation=entry.pronunciation,
            usage_example=entry.usage_example,
            tags=entry.tags.split(",") if entry.tags else None,
            is_favorite=entry.is_favorite,
            created_at=entry.created_at
        )

DictionaryQueries = [
    get_dictionary_entries,
    search_dictionary,
    get_dictionary_entry
]
