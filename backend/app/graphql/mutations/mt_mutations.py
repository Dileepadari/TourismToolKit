import strawberry
from typing import List, Optional
import base64 # Not strictly needed for MT, but kept for consistency with the example
from app.graphql.types.mt_types import MTResponse, MTInput
from app.services.mt import MachineTranslationService # Assuming the service is located here

@strawberry.mutation
def translate_text(input: MTInput) -> MTResponse:
    """Translate text from source_lang to target_lang"""
    
    source_lang = input.source_lang
    target_lang = input.target_lang
    
    try:
        print(f"Translating text from {source_lang} to {target_lang}")
        translated_text = MachineTranslationService.translate_text(
            text=input.text,
            source_lang=source_lang,
            target_lang=target_lang
        )
        print(f"Translation result: {translated_text}")

        # The service method is expected to return a string (the translated text)
        if isinstance(translated_text, str):
            return MTResponse(
                success=True,
                translated_text=translated_text,
                message="Text translated successfully",
                source_lang=source_lang,
                target_lang=target_lang
            )
        else:
            # Handle case where MT API returns unexpected format
            return MTResponse(
                success=False,
                translated_text=None,
                message=f"Unexpected translation format received: {type(translated_text).__name__}. Expected string.",
                source_lang=source_lang,
                target_lang=target_lang
            )
        
    except Exception as e:
        # Catch exceptions thrown by the service layer (e.g., API errors, config issues)
        return MTResponse(
            success=False,
            translated_text=None,
            message=f"Error translating text: {str(e)}",
            source_lang=source_lang,
            target_lang=target_lang
        )
    
MTMutations = [
    translate_text
]