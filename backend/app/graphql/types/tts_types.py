import strawberry
from typing import List, Optional

@strawberry.type
class Language_tts:
    code: str
    name: str

@strawberry.type
class LanguageResponse:
    languages: List[Language_tts]

@strawberry.type
class TTSResponse:
    success: bool
    message: Optional[str] = None
    audio_content: Optional[str] = None  # Base64 encoded audio

@strawberry.input
class TTSInput:
    text: str
    gender: str
    # language: str = "en"

@strawberry.type
class ApiUrlResponse:
    url: Optional[str] = None
    language: str
    found: bool