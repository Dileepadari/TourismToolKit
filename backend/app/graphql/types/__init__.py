"""Public GraphQL type exports.

The previous version listed ``"Language"`` in ``__all__`` while importing
``Language_tts``, so ``from app.graphql.types import *`` raised AttributeError.
"""

from app.graphql.types.ai_types import (
    ASRInput,
    ASRResponse,
    MTInput,
    MTResponse,
    OCRInput,
    OCRResponse,
    TTSInput,
    TTSResponse,
)
from app.graphql.types.common import Language, LanguagesResponse
from app.graphql.types.tourism_types import (
    AuthResponse,
    CultureTip,
    DictionaryEntry,
    DictionaryInput,
    DictionaryResponse,
    EmergencyContact,
    LoginInput,
    LogoutResponse,
    Phrase,
    PhrasesResponse,
    Place,
    RegisterInput,
    TravelHistory,
    TravelHistoryInput,
    User,
)

__all__ = [
    "ASRInput",
    "ASRResponse",
    "AuthResponse",
    "CultureTip",
    "DictionaryEntry",
    "DictionaryInput",
    "DictionaryResponse",
    "EmergencyContact",
    "Language",
    "LanguagesResponse",
    "LoginInput",
    "LogoutResponse",
    "MTInput",
    "MTResponse",
    "OCRInput",
    "OCRResponse",
    "Phrase",
    "PhrasesResponse",
    "Place",
    "RegisterInput",
    "TTSInput",
    "TTSResponse",
    "TravelHistory",
    "TravelHistoryInput",
    "User",
]
