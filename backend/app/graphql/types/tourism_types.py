import strawberry
from typing import Optional, List
from datetime import datetime

@strawberry.type
class User:
    id: int
    email: str
    username: str
    full_name: Optional[str]
    profile_picture: Optional[str]
    preferred_language: str
    preferred_theme: str
    home_country: Optional[str]
    is_verified: bool
    created_at: datetime

@strawberry.type
class AuthResponse:
    success: bool
    message: str
    token: Optional[str]
    user: Optional[User]

@strawberry.input
class RegisterInput:
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    preferred_language: str = "en"
    preferred_theme: str = "light"
    home_country: Optional[str] = None

@strawberry.input
class LoginInput:
    email: str
    password: str

@strawberry.type
class Language:
    code: str
    name: str

@strawberry.type
class LanguagesResponse:
    languages: List[Language]

@strawberry.type
class TranslationResponse:
    success: bool
    translated_text: Optional[str]
    error: Optional[str]

@strawberry.type
class OCRResponse:
    success: bool
    extracted_text: Optional[str]
    error: Optional[str]

@strawberry.type
class STTResponse:
    success: bool
    transcribed_text: Optional[str]
    error: Optional[str]

@strawberry.type
class Place:
    id: int
    name: str
    description: Optional[str]
    country: str
    state: Optional[str]
    city: str
    latitude: Optional[float]
    longitude: Optional[float]
    category: Optional[str]
    images: Optional[List[str]]
    languages_spoken: Optional[List[str]]
    best_time_to_visit: Optional[str]
    entry_fee: Optional[float]
    rating: Optional[float]

@strawberry.type
class DictionaryEntry:
    id: int
    word: str
    translation: str
    language_from: str
    language_to: str
    pronunciation: Optional[str]
    usage_example: Optional[str]
    tags: Optional[List[str]]
    is_favorite: bool
    created_at: datetime

@strawberry.input
class DictionaryInput:
    word: str
    translation: str
    language_from: str
    language_to: str
    pronunciation: Optional[str] = None
    usage_example: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: bool = False

@strawberry.type
class TravelHistory:
    id: int
    destination: str
    country: str
    visit_date: Optional[datetime]
    notes: Optional[str]
    photos: Optional[List[str]]
    favorite_phrases: Optional[List[str]]
    created_at: datetime

@strawberry.input
class TravelHistoryInput:
    destination: str
    country: str
    visit_date: Optional[datetime] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None
    favorite_phrases: Optional[List[str]] = None

@strawberry.type
class EmergencyContact:
    id: int
    country: str
    service_type: str
    number: str
    description: Optional[str]

@strawberry.type
class CultureTip:
    id: int
    country: str
    tip_category: str
    tip_text: str
    language: str

@strawberry.type
class Phrase:
    phrase: str
    category: str

@strawberry.type
class PhrasesResponse:
    phrases: List[Phrase]