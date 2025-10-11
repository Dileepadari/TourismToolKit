import strawberry
from typing import List, Optional

@strawberry.type
class Language:
    code: str
    name: str

@strawberry.type
class LanguageResponse:
    languages: List[Language]

@strawberry.type
class TTSResponse:
    success: bool
    message: Optional[str] = None
    audio_content: Optional[str] = None  # Base64 encoded audio

@strawberry.input
class TTSInput:
    text: str
    gender: str
    language: str = "en"

@strawberry.type
class ApiUrlResponse:
    url: Optional[str] = None
    language: str
    found: bool