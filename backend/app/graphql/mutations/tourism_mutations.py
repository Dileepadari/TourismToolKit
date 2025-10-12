import strawberry
from typing import Optional
from ..types.tts_types import TTSResponse
from ..types.tourism_types import (
    AuthResponse, RegisterInput, LoginInput, 
    TranslationResponse, OCRResponse, STTResponse, DictionaryEntry, 
    DictionaryInput, TravelHistory, TravelHistoryInput
)
from ...services.auth import AuthService

@strawberry.mutation
def register(self, input: RegisterInput) -> AuthResponse:
    """Register a new user"""
    # In a real implementation, you would:
    # 1. Check if email/username already exists
    # 2. Hash password
    # 3. Save to database
    # 4. Generate JWT token
    
    # Mock implementation
    if "@" not in input.email:
        return AuthResponse(
            success=False,
            message="Invalid email format",
            token=None,
            user=None
        )
    
    # Mock successful registration
    from ..types.tourism_types import User
    from datetime import datetime
    
    user = User(
        id=1,
        email=input.email,
        username=input.username,
        full_name=input.full_name,
        profile_picture=None,
        preferred_language=input.preferred_language,
        preferred_theme=input.preferred_theme,
        home_country=input.home_country,
        is_verified=False,
        created_at=datetime.now()
    )
    
    token = AuthService.create_access_token({"sub": input.email, "user_id": 1})
    
    return AuthResponse(
        success=True,
        message="User registered successfully",
        token=token,
        user=user
    )

@strawberry.mutation
def login(self, input: LoginInput) -> AuthResponse:
    """Login user"""
    try:
        # Authenticate user against database
        db_user = AuthService.authenticate_user(input.email, input.password)
        
        if not db_user:
            return AuthResponse(
                success=False,
                message="Invalid email or password",
                token=None,
                user=None
            )
        
        if not db_user.is_active:
            return AuthResponse(
                success=False,
                message="Account is deactivated",
                token=None,
                user=None
            )
        
        # Create GraphQL User object
        from ..types.tourism_types import User
        user = User(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            full_name=db_user.full_name,
            profile_picture=db_user.profile_picture,
            preferred_language=db_user.preferred_language,
            preferred_theme=db_user.preferred_theme,
            home_country=db_user.home_country,
            is_verified=db_user.is_verified,
            created_at=db_user.created_at
        )
        
        # Generate JWT token
        token = AuthService.create_access_token({
            "sub": db_user.email, 
            "user_id": db_user.id
        })
        
        return AuthResponse(
            success=True,
            message="Login successful",
            token=token,
            user=user
        )
        
    except Exception as e:
        print(f"Login error: {e}")
        return AuthResponse(
            success=False,
            message=f"Login failed: {str(e)}",
            token=None,
            user=None
        )

@strawberry.mutation
def add_dictionary_entry(self, user_id: int, input: DictionaryInput) -> DictionaryEntry:
    """Add entry to user's personal dictionary"""
    # Mock implementation
    from datetime import datetime
    
    entry = DictionaryEntry(
        id=1,  # In real implementation, get from database
        word=input.word,
        translation=input.translation,
        language_from=input.language_from,
        language_to=input.language_to,
        pronunciation=input.pronunciation,
        usage_example=input.usage_example,
        tags=input.tags,
        is_favorite=input.is_favorite,
        created_at=datetime.now()
    )
    
    return entry

@strawberry.mutation
def add_travel_history(self, user_id: int, input: TravelHistoryInput) -> TravelHistory:
    """Add entry to user's travel history"""
    # Mock implementation
    from datetime import datetime
    
    history = TravelHistory(
        id=1,  # In real implementation, get from database
        destination=input.destination,
        country=input.country,
        visit_date=input.visit_date,
        notes=input.notes,
        photos=input.photos,
        favorite_phrases=input.favorite_phrases,
        created_at=datetime.now()
    )
    
    return history

@strawberry.mutation
def update_user_preferences(self, user_id: int, 
                               preferred_language: Optional[str] = None,
                               preferred_theme: Optional[str] = None) -> AuthResponse:
        """Update user preferences"""
        # Mock implementation
        return AuthResponse(
            success=True,
            message="Preferences updated successfully",
            token=None,
            user=None
        )
    
TourismMutations = [update_user_preferences, add_travel_history, add_dictionary_entry, login, register]