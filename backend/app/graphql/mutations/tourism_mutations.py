import strawberry
from typing import Optional
from ..types.tourism_types import (
    AuthResponse, RegisterInput, LoginInput, TTSResponse, 
    TranslationResponse, OCRResponse, STTResponse, DictionaryEntry, 
    DictionaryInput, TravelHistory, TravelHistoryInput
)
from ...services.enhanced_tts import (
    TextToSpeechService, TranslationService, 
    OCRService, SpeechToTextService
)
from ...services.auth import AuthService

@strawberry.type
class TourismMutations:
    
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
        # Mock implementation
        # In real implementation, verify credentials against database
        
        if input.email == "test@example.com" and input.password == "password":
            from ..types.tourism_types import User
            from datetime import datetime
            
            user = User(
                id=1,
                email=input.email,
                username="testuser",
                full_name="Test User",
                profile_picture=None,
                preferred_language="en",
                preferred_theme="light",
                home_country="India",
                is_verified=True,
                created_at=datetime.now()
            )
            
            token = AuthService.create_access_token({"sub": input.email, "user_id": 1})
            
            return AuthResponse(
                success=True,
                message="Login successful",
                token=token,
                user=user
            )
        
        return AuthResponse(
            success=False,
            message="Invalid credentials",
            token=None,
            user=None
        )
    
    @strawberry.mutation
    def generate_speech(self, text: str, gender: str, language: str = "en") -> TTSResponse:
        """Generate speech from text"""
        result = TextToSpeechService.generate_speech(text, gender, language)
        
        if isinstance(result, dict) and "error" in result:
            return TTSResponse(
                success=False,
                audio_url=None,
                error=result["error"]
            )
        
        return TTSResponse(
            success=True,
            audio_url=result if isinstance(result, str) else "audio_generated",
            error=None
        )
    
    @strawberry.mutation
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> TranslationResponse:
        """Translate text between languages"""
        result = TranslationService.translate_text(text, source_lang, target_lang)
        
        if "error" in result:
            return TranslationResponse(
                success=False,
                translated_text=None,
                error=result["error"]
            )
        
        return TranslationResponse(
            success=True,
            translated_text=result["translated_text"],
            error=None
        )
    
    @strawberry.mutation
    def extract_text_from_image(self, image_data: str, language: str = "en") -> OCRResponse:
        """Extract text from image using OCR"""
        result = OCRService.extract_text_from_image(image_data, language)
        
        if "error" in result:
            return OCRResponse(
                success=False,
                extracted_text=None,
                error=result["error"]
            )
        
        return OCRResponse(
            success=True,
            extracted_text=result["extracted_text"],
            error=None
        )
    
    @strawberry.mutation
    def transcribe_audio(self, audio_data: str, language: str = "en") -> STTResponse:
        """Convert speech to text"""
        result = SpeechToTextService.transcribe_audio(audio_data, language)
        
        if "error" in result:
            return STTResponse(
                success=False,
                transcribed_text=None,
                error=result["error"]
            )
        
        return STTResponse(
            success=True,
            transcribed_text=result["transcribed_text"],
            error=None
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