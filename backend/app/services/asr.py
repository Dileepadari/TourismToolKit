import os
import requests
import base64
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

class AudioSpeechRecognitionService:
    """ASR Service using Canvas API for multilingual speech recognition"""
    
    # Language-specific ASR endpoints (URLs loaded from .env)
    ASR_ENDPOINTS = {
        "hi": os.getenv("BASHINI_ASR_API_URL_HI"),
        "en": os.getenv("BASHINI_ASR_API_URL_EN"),
        "mr": os.getenv("BASHINI_ASR_API_URL_MR"),
        "gu": os.getenv("BASHINI_ASR_API_URL_GU"),
        "bn": os.getenv("BASHINI_ASR_API_URL_BN"),
        "te": os.getenv("BASHINI_ASR_API_URL_TE"),
        "kn": os.getenv("BASHINI_ASR_API_URL_KN"),
        "ml": os.getenv("BASHINI_ASR_API_URL_ML"),
        "ta": os.getenv("BASHINI_ASR_API_URL_TA"),
        "pa": os.getenv("BASHINI_ASR_API_URL_PA"),
    }
    
    # Language-specific ASR tokens (loaded from .env)
    ASR_TOKENS = {
        "hi": os.getenv("BASHINI_ASR_API_TOKEN_HI"),
        "en": os.getenv("BASHINI_ASR_API_TOKEN_EN"),
        "mr": os.getenv("BASHINI_ASR_API_TOKEN_MR"),
        "gu": os.getenv("BASHINI_ASR_API_TOKEN_GU"),
        "bn": os.getenv("BASHINI_ASR_API_TOKEN_BN"),
        "te": os.getenv("BASHINI_ASR_API_TOKEN_TE"),
        "kn": os.getenv("BASHINI_ASR_API_TOKEN_KN"),
        "ml": os.getenv("BASHINI_ASR_API_TOKEN_ML"),
        "ta": os.getenv("BASHINI_ASR_API_TOKEN_TA"),
        "pa": os.getenv("BASHINI_ASR_API_TOKEN_PA"),
    }
    
    @staticmethod
    def get_supported_languages():
        """Get list of supported languages for ASR"""
        return {
            "languages": [
                {"code": "en", "name": "English"},
                {"code": "hi", "name": "Hindi"},
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
    def recognize_speech(audio_data: str, language: str = "en") -> Dict[str, Any]:
        """
        Transcribe audio to text using Canvas ASR API
        
        Args:
            audio_data: Base64 encoded audio string (WAV/MP3 format)
            language: Language code (en, hi, te, ta, kn, ml, bn, gu, mr, pa)
            
        Returns:
            Dictionary with transcribed_text or error
        """
        # Get the appropriate endpoint for the language
        api_url = AudioSpeechRecognitionService.ASR_ENDPOINTS.get(language)
        
        if not api_url:
            return {
                "success": False,
                "error": f"Unsupported language: {language}. Supported languages: {', '.join(AudioSpeechRecognitionService.ASR_ENDPOINTS.keys())}"
            }
        
        # Get the token for the language
        access_token = AudioSpeechRecognitionService.ASR_TOKENS.get(language)
        
        if not access_token:
            return {
                "success": False,
                "error": f"ASR token not configured for language: {language}"
            }
        
        # Prepare headers - use 'access-token' header (same as TTS/OCR API)
        # NO Content-Type for multipart/form-data (requests will set it)
        headers = {
            "access-token": access_token
        }
        
        # Remove data URL prefix if present (data:audio/wav;base64,...)
        if "," in audio_data:
            audio_data = audio_data.split(",", 1)[1]
        
        try:
            # Decode base64 to bytes
            audio_bytes = base64.b64decode(audio_data)
            
            # Determine audio format from the first few bytes
            # WAV files start with "RIFF"
            if audio_bytes.startswith(b'RIFF'):
                audio_format = 'audio/wav'
                filename = 'audio.wav'
            elif audio_bytes.startswith(b'\xff\xfb') or audio_bytes.startswith(b'\xff\xf3') or audio_bytes.startswith(b'ID3'):
                # MP3 files
                audio_format = 'audio/mpeg'
                filename = 'audio.mp3'
            else:
                # Default to WAV
                audio_format = 'audio/wav'
                filename = 'audio.wav'
            
            # Create file-like object for the audio
            # The API expects form-data with an 'audio_file' field
            files = {
                'audio_file': (filename, audio_bytes, audio_format)
            }
            
            print(f"DEBUG: Calling ASR API for language: {language}")
            print(f"DEBUG: API URL: {api_url}")
            print(f"DEBUG: Sending file as form-data: {filename} ({len(audio_bytes)} bytes)")
            
            # Make the API request with form-data
            response = requests.post(
                api_url,
                files=files,
                headers=headers,
                verify=False,  # Disable SSL verification for canvas.iiit.ac.in
                timeout=30
            )
            
            print(f"DEBUG: ASR Response status: {response.status_code}")
            print(f"DEBUG: ASR Response: {response.text[:500]}")  # Log first 500 chars
            
            # Check for HTTP errors
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"ASR API error: {response.status_code} - {response.text}"
                }
            
            # Parse the response
            data = response.json()
            
            # Canvas API returns response in format:
            # {"status": "success", "message": "...", "data": {"recognized_text": "..."}, "code": 200}
            
            # Extract transcribed text from various possible response formats
            transcribed_text = None
            
            # Check if response has the expected structure
            if isinstance(data, dict):
                # Try common field names for transcribed text
                if data.get("status") == "success" or data.get("code") == 200:
                    # Look for transcription in data field (prioritize recognized_text)
                    if "data" in data and isinstance(data["data"], dict):
                        transcribed_text = (
                            data["data"].get("recognized_text") or
                            data["data"].get("transcription") or 
                            data["data"].get("text") or 
                            data["data"].get("transcribed_text")
                        )
                    
                    # Fallback: check top-level fields
                    if not transcribed_text:
                        transcribed_text = (
                            data.get("transcription") or 
                            data.get("text") or 
                            data.get("transcribed_text") or
                            data.get("recognized_text")
                        )
                
                # Check for error response
                if data.get("status") == "error" or data.get("error"):
                    error_msg = data.get("message") or data.get("error") or "Unknown ASR error"
                    return {
                        "success": False,
                        "error": f"ASR API error: {error_msg}"
                    }
            
            if transcribed_text:
                return {
                    "success": True,
                    "transcribed_text": transcribed_text,
                    "language": language
                }
            else:
                # If we couldn't find the text, return the full response for debugging
                return {
                    "success": False,
                    "error": f"Could not extract transcribed text from response. Response: {str(data)[:200]}"
                }
                
        except base64.binascii.Error as e:
            return {
                "success": False,
                "error": f"Invalid base64 audio data: {str(e)}"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"ASR processing error: {str(e)}"
            }

