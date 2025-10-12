import strawberry
from typing import List, Optional
from .types.tourism_types import (
    User as GraphQLUser, AuthResponse, RegisterInput, LoginInput, Language, LanguagesResponse,
    Place as GraphQLPlace, DictionaryEntry as GraphQLDictionaryEntry, DictionaryInput, 
    TravelHistory as GraphQLTravelHistory, TravelHistoryInput,
    EmergencyContact as GraphQLEmergencyContact, CultureTip as GraphQLCultureTip, PhrasesResponse
)
from .types.tts_types import TTSResponse, TTSInput
from ..services.enhanced_tts import (
    TextToSpeechService, TranslationService, 
    OCRService, SpeechToTextService, TourismService
)
from ..services.auth import AuthService
from ..database.db import get_session
from datetime import datetime

@strawberry.type
class Query:
    @strawberry.field
    def get_supported_languages(self) -> LanguagesResponse:
        """Get all supported languages for translation and TTS"""
        languages_data = TranslationService.get_supported_languages()
        languages = [Language(code=lang["code"], name=lang["name"]) 
                    for lang in languages_data["languages"]]
        return LanguagesResponse(languages=languages)
    
    @strawberry.field
    def get_places(self, country: Optional[str] = None, 
                   category: Optional[str] = None, 
                   limit: Optional[int] = None) -> List["GraphQLPlace"]:
        """Get tourism places with optional filters"""
        try:
            places_data = TourismService.get_places(
                country=country, 
                category=category, 
                limit=limit
            )
            return [GraphQLPlace(**place) for place in places_data]
        except Exception as e:
            print(f"Error fetching places: {e}")
            return []

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

@strawberry.type
class Mutation:
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

    @strawberry.mutation
    def generate_speech(self, input: TTSInput) -> TTSResponse:
        """Generate speech from text"""
        try:
            audio_content = TextToSpeechService.generate_speech(
                text=input.text,
                gender=input.gender,
                language=input.language
            )
            
            return TTSResponse(
                success=True,
                message="Speech generated successfully",
                audio_url=audio_content,
                audio_content=audio_content
            )
        except Exception as e:
            return TTSResponse(
                success=False,
                message=f"Error generating speech: {str(e)}"
            )

schema = strawberry.Schema(query=Query, mutation=Mutation)
