import strawberry
from typing import List
from app.services.asr import AudioSpeechRecognitionService

@strawberry.type
class Language:
    code: str
    name: str

@strawberry.field
def supported_asr_languages() -> List[Language]:
    """Get list of supported languages for ASR"""
    languages_data = AudioSpeechRecognitionService.get_supported_languages()
    return [
        Language(code=lang["code"], name=lang["name"])
        for lang in languages_data["languages"]
    ]

ASRQueries = [
    supported_asr_languages
]
