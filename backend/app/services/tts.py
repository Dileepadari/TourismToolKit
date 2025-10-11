import io
import os
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

# Load environment variables
load_dotenv()

# Get token from environment variables
TOKEN = os.getenv("BASHINI_API_TOKEN")

# TTS request model
class TTSRequest(BaseModel):
    text: str
    gender: str
    language: str = "en"
    # voice_id: ptional[str] = None
    # speed: Optional[float] = 1.0

# Create router
router = APIRouter(prefix="/tts", tags=["Text to Speech"])

class TextToSpeechService:
    @staticmethod
    def get_supported_languages():
        """Get list of supported languages for TTS"""
        return {
            "languages": [
                {"code": "hi", "name": "Hindi"},
                {"code": "en", "name": "English"},
                {"code": "te", "name": "Telugu"},
                {"code": "ta", "name": "Tamil"},
                {"code": "kn", "name": "Kannada"},
                {"code": "ml", "name": "Malayalam"},
                {"code": "bn", "name": "Bengali"},
                {"code": "gu", "name": "Gujarati"},
                {"code": "mr", "name": "Marathi"},
                {"code": "pa", "name": "Punjabi"}
            ]
        }
    
    @staticmethod
    def get_api_url_for_language(language: str) -> str:
        """Get the appropriate API URL for the specified language"""
        # Convert language code to uppercase for environment variable format
        language_code = language.upper()
        
        # Get the language-specific URL or fall back to default
        env_var_name = f"BASHINI_TTS_API_URL_{language_code}"
        api_url = os.getenv(env_var_name)
        
        if not api_url:
            # Fall back to default URL if language-specific URL not found
            api_url = os.getenv("BASHINI_TTS_API_URL_DEFAULT")
            
        return api_url
    
    @staticmethod
    def generate_speech(text: str, gender: str, language: str = "en"):
        """Generate speech audio from text using Bashini TTS API"""
        
        # Get the appropriate API URL for the specified language
        tts_api_url = TextToSpeechService.get_api_url_for_language(language)
        
        if not tts_api_url:
            raise HTTPException(
                status_code=500,
                detail="TTS API URL not configured. Please check environment variables."
            )
        
        headers = {
            "access-token": TOKEN
        }
        
        payload = {
            "text": text,
            "gender": gender
        }
        
        try:
            response = requests.post(tts_api_url, headers=headers, json=payload)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"TTS API error: {response.text}"
                )
            
            # For binary audio response
            if "audio" in response.headers.get("Content-Type", ""):
                return response.content
            
            # For JSON response with audio URL
            data = response.json()
            if "audio_url" in data:
                audio_response = requests.get(data["audio_url"])
                return audio_response.content
                
            raise HTTPException(
                status_code=500,
                detail="Unexpected response format from TTS API"
            )
                
        except requests.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error communicating with TTS API: {str(e)}"
            )

@router.post("/generate")
async def generate_speech_endpoint(request: TTSRequest):
    """Generate speech from text using specified language"""
    audio_content = TextToSpeechService.generate_speech(
        text=request.text,
        # language=request.language,
        gender=request.gender
    )
    
    return StreamingResponse(
        io.BytesIO(audio_content),
        media_type="audio/mp3",
        headers={"Content-Disposition": f"attachment; filename=speech.mp3"}
    )

@router.get("/languages")
async def get_languages():
    """Get list of supported languages for text-to-speech"""
    return TextToSpeechService.get_supported_languages()