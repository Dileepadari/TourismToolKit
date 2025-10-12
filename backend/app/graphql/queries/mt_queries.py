import strawberry
from typing import List
# Assuming Language type is defined and accessible here
from app.graphql.types.tts_types import Language_tts
from app.services.mt import MachineTranslationService # Import your MT service

@strawberry.field
def supported_mt_languages() -> List[Language_tts]:
    """
    Get list of supported languages for Machine Translation.
    
    Note: A real-world MT API might require checking supported source/target pairs, 
    but this implementation returns a simple list of languages supported across the service.
    """
    
    # Assuming MachineTranslationService has a static method similar to TTS to get all MT-supported languages
    # The structure of the returned data is assumed to be similar to TTS: 
    # {"languages": [{"code": "en", "name": "English"}, ...]}
    languages_data = MachineTranslationService.get_supported_languages()
    
    # Map the dictionary list from the service to the Strawberry Language type
    return [
        Language_tts(code=lang["code"], name=lang["name"]) 
        for lang in languages_data.get("languages", [])
    ]

MTQueries = [
    supported_mt_languages
]