"""Static language catalogues for each upstream service.

These are plain data and were previously duplicated as ``get_supported_languages``
staticmethods across four service classes.
"""

from __future__ import annotations

# Every language the platform knows a name for.
LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
    "gu": "Gujarati",
    "mr": "Marathi",
    "pa": "Punjabi",
    "ur": "Urdu",
    "as": "Assamese",
    "or": "Odia",
}

# Per-service coverage. These reflect which upstream endpoints actually exist -
# the frontend ships 13 locale files, but the API cannot translate all of them.
TTS_LANGUAGES = ("hi", "en", "gu", "mr")
MT_LANGUAGES = ("te", "hi", "en", "ta", "kn")
ASR_LANGUAGES = ("en", "hi", "te", "ta", "kn", "ml", "bn", "gu", "mr", "pa")
OCR_LANGUAGES = ("en", "hi", "te", "ta", "kn", "ml", "bn", "gu", "mr", "pa")


def as_dicts(codes: tuple[str, ...]) -> list[dict[str, str]]:
    return [{"code": code, "name": LANGUAGE_NAMES[code]} for code in codes]


def all_supported() -> list[dict[str, str]]:
    """Union of every service's coverage, in a stable order."""
    seen = {*TTS_LANGUAGES, *MT_LANGUAGES, *ASR_LANGUAGES, *OCR_LANGUAGES}
    ordered = tuple(code for code in LANGUAGE_NAMES if code in seen)
    return as_dicts(ordered)
