import strawberry

# from typing import List, Optional
# from ..types.tourism_types import (
#     User, Language, LanguagesResponse, Place, DictionaryEntry, 
#     TravelHistory, EmergencyContact, CultureTip, PhrasesResponse
# )

from typing import List, Optional
from ..types.tourism_types import (
    User as GraphQLUser, AuthResponse, RegisterInput, LoginInput, LanguagesResponse,
    Place as GraphQLPlace, DictionaryEntry as GraphQLDictionaryEntry, DictionaryInput, 
    TravelHistory,
    EmergencyContact, CultureTip, PhrasesResponse
)
from ..types.tts_types import TTSResponse, TTSInput
from ...services.auth import AuthService
from ...database.db import get_session
from datetime import datetime

@strawberry.field
def get_user_dictionary(self, user_id: int, 
                        language_from: Optional[str] = None,
                        language_to: Optional[str] = None) -> List["GraphQLDictionaryEntry"]:
    """Get user's dictionary entries"""
    try:
        entries = TourismService.get_user_dictionary(
            user_id=user_id,
            language_from=language_from,
            language_to=language_to
        )
        return [GraphQLDictionaryEntry(**entry) for entry in entries]
    except Exception as e:
        print(f"Error fetching dictionary: {e}")
        return []

@strawberry.field
def get_travel_history(self, user_id: int) -> List[TravelHistory]:
    """Get user's travel history"""
    # This would query your database
    from datetime import datetime
    
    sample_history = [
        TravelHistory(
            id=1,
            destination="Goa",
            country="India",
            visit_date=datetime(2023, 12, 15),
            notes="Beautiful beaches and great seafood",
            photos=["goa_beach.jpg", "goa_sunset.jpg"],
            favorite_phrases=["Obrigado (Thank you in Portuguese)", "Susegad (Relaxed lifestyle)"],
            created_at=datetime.now()
        )
    ]
    
    return sample_history

@strawberry.field
def get_emergency_contacts(self, country: str) -> List[EmergencyContact]:
    """Get emergency contacts for a specific country"""
    # Sample data for India
    if country.lower() == "india":
        return [
            EmergencyContact(
                id=1,
                country="India",
                service_type="police",
                number="100",
                description="Police Emergency"
            ),
            EmergencyContact(
                id=2,
                country="India",
                service_type="ambulance",
                number="102",
                description="Ambulance Service"
            ),
            EmergencyContact(
                id=3,
                country="India",
                service_type="fire",
                number="101",
                description="Fire Brigade"
            ),
            EmergencyContact(
                id=4,
                country="India",
                service_type="tourist_helpline",
                number="1363",
                description="Tourist Helpline"
            )
        ]
    return []

@strawberry.field
def get_culture_tips(self, country: str, language: str = "en") -> List[CultureTip]:
    """Get cultural tips for a specific country"""
    # Sample data for India
    if country.lower() == "india":
        return [
            CultureTip(
                id=1,
                country="India",
                tip_category="greeting",
                tip_text="Namaste is a common greeting. Join palms together and bow slightly.",
                language=language
            ),
            CultureTip(
                id=2,
                country="India",
                tip_category="dining",
                tip_text="Remove shoes when entering someone's home. Eating with hands is common.",
                language=language
            ),
            CultureTip(
                id=3,
                country="India",
                tip_category="customs",
                tip_text="Dress modestly when visiting religious places. Cover shoulders and knees.",
                language=language
            )
        ]
    return []

@strawberry.field
def get_emergency_phrases(self, language: str = "en") -> PhrasesResponse:
    """Get emergency phrases in specified language"""
    phrases = TourismService.get_emergency_phrases(language)
    return PhrasesResponse(phrases=phrases)

@strawberry.field
def get_common_phrases(self, language: str = "en") -> PhrasesResponse:
    """Get common travel phrases in specified language"""
    phrases = TourismService.get_common_phrases(language)
    return PhrasesResponse(phrases=phrases)


@strawberry.mutation
def register(self, input: RegisterInput) -> AuthResponse:
    """Register a new user"""
    try:
        # Validate input
        if "@" not in input.email:
            return AuthResponse(
                success=False,
                message="Invalid email format",
                token=None,
                user=None
            )
        
        if len(input.password) < 6:
            return AuthResponse(
                success=False,
                message="Password must be at least 6 characters long",
                token=None,
                user=None
            )
        
        # Create user in database
        db_user = AuthService.create_user(
            email=input.email,
            username=input.username,
            password=input.password,
            full_name=input.full_name,
            preferred_language=input.preferred_language,
            preferred_theme=input.preferred_theme,
            home_country=input.home_country
        )
        
        if not db_user:
            return AuthResponse(
                success=False,
                message="Email or username already exists",
                token=None,
                user=None
            )
        
        # Create GraphQL User object
        user = GraphQLUser(
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
            message="User registered successfully",
            token=token,
            user=user
        )
    except Exception as e:
        print(f"Registration error: {e}")
        return AuthResponse(
            success=False,
            message=f"Registration failed: {str(e)}",
            token=None,
            user=None
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
        user = GraphQLUser(
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


TourismQueries = [login, register, get_common_phrases, get_emergency_phrases, get_culture_tips, get_emergency_contacts, get_travel_history, get_user_dictionary]
                 