"""Input/response types for the four upstream AI services.

OCR and ASR types used to be declared inside their *mutation* modules, which is
how ``OCRResponse`` ended up defined twice with different fields.
"""

from __future__ import annotations

import strawberry

# --- Text to speech ---------------------------------------------------------


@strawberry.input
class TTSInput:
    text: str
    gender: str


@strawberry.type
class TTSResponse:
    success: bool
    message: str | None = None
    audio_content: str | None = None  # data: URI with base64 audio


# --- Machine translation ----------------------------------------------------


@strawberry.input
class MTInput:
    text: str
    source_lang: str
    target_lang: str


@strawberry.type
class MTResponse:
    source_lang: str
    target_lang: str
    success: bool
    translated_text: str | None = None
    message: str | None = None


# --- Optical character recognition ------------------------------------------


@strawberry.input
class OCRInput:
    image_data: str  # base64-encoded image
    language: str = "en"


@strawberry.type
class OCRResponse:
    success: bool
    message: str | None = None
    extracted_text: str | None = None
    language: str | None = None
    error: str | None = None


# --- Automatic speech recognition -------------------------------------------


@strawberry.input
class ASRInput:
    audio_data: str  # base64-encoded audio
    language: str = "en"


@strawberry.type
class ASRResponse:
    success: bool
    message: str
    transcribed_text: str | None = None
    language: str | None = None
    error: str | None = None
