import strawberry
import base64
from app.graphql.types.tts_types import TTSResponse, TTSInput
from app.services.tts import TextToSpeechService

@strawberry.mutation
def generate_speech(input: TTSInput) -> TTSResponse:
    """Generate speech from text using specified language and gender"""
    try:
        audio_content = TextToSpeechService.generate_speech(
            text=input.text,
            gender=input.gender,
            language=input.language
        )

        # Check if audio_content is bytes or already a string/dict
        if isinstance(audio_content, bytes):
            # Convert audio content to base64 for GraphQL response
            audio_base64 = base64.b64encode(audio_content).decode('utf-8')
            
            return TTSResponse(
                success=True,
                message="Speech generated successfully",
                audio_content=f"data:audio/mp3;base64,{audio_base64}"
            )
        else:
            # Handle case where TTS API returns different format
            return TTSResponse(
                success=False,
                message=f"Unexpected audio format received: {type(audio_content).__name__}. Expected bytes."
            )
        
    except Exception as e:
        return TTSResponse(
            success=False,
            message=f"Error generating speech: {str(e)}"
        )
    
TTSMutations = [
    generate_speech
]