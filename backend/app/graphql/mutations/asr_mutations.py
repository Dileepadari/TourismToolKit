import strawberry
from typing import Optional
from app.services.asr import AudioSpeechRecognitionService

@strawberry.input
class ASRInput:
    audio_data: str
    language: str = "en"

@strawberry.type
class ASRResponse:
    success: bool
    message: str
    transcribed_text: Optional[str] = None
    language: Optional[str] = None
    error: Optional[str] = None

@strawberry.mutation
def transcribe_audio(input: ASRInput) -> ASRResponse:
    """Transcribe audio to text using ASR"""
    try:
        result = AudioSpeechRecognitionService.recognize_speech(
            audio_data=input.audio_data,
            language=input.language
        )
        
        if result.get("success"):
            return ASRResponse(
                success=True,
                message="Audio transcribed successfully",
                transcribed_text=result.get("transcribed_text"),
                language=result.get("language")
            )
        else:
            return ASRResponse(
                success=False,
                message="Failed to transcribe audio",
                error=result.get("error")
            )
    except Exception as e:
        return ASRResponse(
            success=False,
            message="ASR processing failed",
            error=str(e)
        )

ASRMutations = [
    transcribe_audio
]
