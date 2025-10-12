import strawberry
from typing import List, Optional

# Re-use from TTS example as languages are common
# @strawberry.type
# class Language:
#     code: str
#     name: str

# @strawberry.type
# class LanguageResponse:
#     languages: List[Language]

# --- Machine Translation Specific Types ---

@strawberry.input
class MTInput:
    """Input for a Machine Translation request."""
    text: str
    source_lang: str
    target_lang: str

@strawberry.type
class MTResponse:
    """Response structure for Machine Translation."""
    success: bool
    translated_text: Optional[str] = None
    message: Optional[str] = None
    # Optionally, include the source and target languages for clarity
    source_lang: str
    target_lang: str
    # Optionally, include a unique job ID if translation is asynchronous
    # job_id: Optional[str] = None

@strawberry.type
class ApiUrlResponse:
    """Response structure for fetching API URL status (re-used/adapted from TTS)."""
    url: Optional[str] = None
    source_lang: str
    target_lang: str
    found: bool