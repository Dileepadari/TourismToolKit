import strawberry
from typing import Optional
from sqlmodel import Session, select
from datetime import datetime
from ..types.tourism_types import (
    DictionaryEntry as GraphQLDictionaryEntry,
    DictionaryInput,
    DictionaryResponse
)
from ...database.db import get_engine
from ...database.models import DictionaryEntry, User

@strawberry.mutation
def add_dictionary_entry(
    self,
    user_id: int,
    input: DictionaryInput
) -> DictionaryResponse:
    """
    Add a new entry to user's personal dictionary.
    User can provide word and translation directly, or use the translate feature.
    """
    engine = get_engine()
    
    try:
        with Session(engine) as session:
            # Verify user exists
            user = session.get(User, user_id)
            if not user:
                return DictionaryResponse(
                    success=False,
                    message="User not found",
                    entry=None
                )
            
            # Create new dictionary entry
            entry = DictionaryEntry(
                user_id=user_id,
                word=input.word,
                translation=input.translation,
                language_from=input.language_from,
                language_to=input.language_to,
                pronunciation=input.pronunciation,
                usage_example=input.usage_example,
                tags=",".join(input.tags) if input.tags else None,
                is_favorite=input.is_favorite,
                created_at=datetime.utcnow()
            )
            
            session.add(entry)
            session.commit()
            session.refresh(entry)
            
            # Convert to GraphQL type
            graphql_entry = GraphQLDictionaryEntry(
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
            
            return DictionaryResponse(
                success=True,
                message="Dictionary entry added successfully",
                entry=graphql_entry
            )
    
    except Exception as e:
        return DictionaryResponse(
            success=False,
            message=f"Error adding dictionary entry: {str(e)}",
            entry=None
        )

@strawberry.mutation
def update_dictionary_entry(
    self,
    entry_id: int,
    user_id: int,
    input: DictionaryInput
) -> DictionaryResponse:
    """Update an existing dictionary entry"""
    engine = get_engine()
    
    try:
        with Session(engine) as session:
            # Get entry and verify ownership
            entry = session.get(DictionaryEntry, entry_id)
            
            if not entry:
                return DictionaryResponse(
                    success=False,
                    message="Dictionary entry not found",
                    entry=None
                )
            
            if entry.user_id != user_id:
                return DictionaryResponse(
                    success=False,
                    message="Unauthorized: You can only update your own entries",
                    entry=None
                )
            
            # Update fields
            entry.word = input.word
            entry.translation = input.translation
            entry.language_from = input.language_from
            entry.language_to = input.language_to
            entry.pronunciation = input.pronunciation
            entry.usage_example = input.usage_example
            entry.tags = ",".join(input.tags) if input.tags else None
            entry.is_favorite = input.is_favorite
            entry.updated_at = datetime.utcnow()
            
            session.add(entry)
            session.commit()
            session.refresh(entry)
            
            # Convert to GraphQL type
            graphql_entry = GraphQLDictionaryEntry(
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
            
            return DictionaryResponse(
                success=True,
                message="Dictionary entry updated successfully",
                entry=graphql_entry
            )
    
    except Exception as e:
        return DictionaryResponse(
            success=False,
            message=f"Error updating dictionary entry: {str(e)}",
            entry=None
        )

@strawberry.mutation
def delete_dictionary_entry(
    self,
    entry_id: int,
    user_id: int
) -> DictionaryResponse:
    """Delete a dictionary entry"""
    engine = get_engine()
    
    try:
        with Session(engine) as session:
            # Get entry and verify ownership
            entry = session.get(DictionaryEntry, entry_id)
            
            if not entry:
                return DictionaryResponse(
                    success=False,
                    message="Dictionary entry not found",
                    entry=None
                )
            
            if entry.user_id != user_id:
                return DictionaryResponse(
                    success=False,
                    message="Unauthorized: You can only delete your own entries",
                    entry=None
                )
            
            session.delete(entry)
            session.commit()
            
            return DictionaryResponse(
                success=True,
                message="Dictionary entry deleted successfully",
                entry=None
            )
    
    except Exception as e:
        return DictionaryResponse(
            success=False,
            message=f"Error deleting dictionary entry: {str(e)}",
            entry=None
        )

@strawberry.mutation
def toggle_favorite_entry(
    self,
    entry_id: int,
    user_id: int
) -> DictionaryResponse:
    """Toggle favorite status of a dictionary entry"""
    engine = get_engine()
    
    try:
        with Session(engine) as session:
            # Get entry and verify ownership
            entry = session.get(DictionaryEntry, entry_id)
            
            if not entry:
                return DictionaryResponse(
                    success=False,
                    message="Dictionary entry not found",
                    entry=None
                )
            
            if entry.user_id != user_id:
                return DictionaryResponse(
                    success=False,
                    message="Unauthorized: You can only update your own entries",
                    entry=None
                )
            
            # Toggle favorite
            entry.is_favorite = not entry.is_favorite
            entry.updated_at = datetime.utcnow()
            
            session.add(entry)
            session.commit()
            session.refresh(entry)
            
            # Convert to GraphQL type
            graphql_entry = GraphQLDictionaryEntry(
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
            
            return DictionaryResponse(
                success=True,
                message=f"Entry {'added to' if entry.is_favorite else 'removed from'} favorites",
                entry=graphql_entry
            )
    
    except Exception as e:
        return DictionaryResponse(
            success=False,
            message=f"Error toggling favorite: {str(e)}",
            entry=None
        )

DictionaryMutations = [
    add_dictionary_entry,
    update_dictionary_entry,
    delete_dictionary_entry,
    toggle_favorite_entry
]
