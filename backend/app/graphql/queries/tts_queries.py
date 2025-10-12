import strawberry
from typing import List
from app.graphql.types.tts_types import Language
from app.services.tts import TextToSpeechService

@strawberry.field
def supported_languages() -> List[Language]:
    """Get list of supported languages for text-to-speech"""
    languages_data = TextToSpeechService.get_supported_languages()
    return [Language(code=lang["code"], name=lang["name"]) for lang in languages_data["languages"]]

TTSQueries = [
    supported_languages
]

