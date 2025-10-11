import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TextToSpeechService:
    @staticmethod
    def get_supported_languages():
        """Get list of supported languages for TTS"""
        return {
            "languages": [
                {"code": "hi", "name": "Hindi"},
                {"code": "en", "name": "English"},
                # {"code": "te", "name": "Telugu"},
                # {"code": "ta", "name": "Tamil"},
                # {"code": "kn", "name": "Kannada"},
                # {"code": "ml", "name": "Malayalam"},
                # {"code": "bn", "name": "Bengali"},
                {"code": "gu", "name": "Gujarati"},
                {"code": "mr", "name": "Marathi"},
                # {"code": "pa", "name": "Punjabi"}
            ]
        }
    
    @staticmethod
    def get_api_token_url_for_language(language: str) -> str:
        """Get the appropriate API and token URL for the specified language"""
        # Convert language code to uppercase for environment variable format
        language_code = language.upper()
        
        # Get the language-specific URL or fall back to default
        api_env_var_name = f"BASHINI_TTS_API_URL_{language_code}"
        print(f"DEBUG: Looking for env var {api_env_var_name}")  # Debug logging
        api_url = os.getenv(api_env_var_name)
        token_env_var_name = f"BASHINI_API_TOKEN_{language_code}"
        print(f"DEBUG: Looking for env var {token_env_var_name}")  # Debug logging
        token = os.getenv(token_env_var_name)

        if not api_url:
            # Fall back to default URL if language-specific URL not found
            api_url = os.getenv("BASHINI_TTS_API_URL_DEFAULT")
            
        return api_url, token
    
    @staticmethod
    def generate_speech(text: str, gender: str, language: str = "en"):
        """Generate speech audio from text using Bashini TTS API"""
        
        # Get the appropriate API URL for the specified language
        tts_api_url, token = TextToSpeechService.get_api_token_url_for_language(language)
        
        if not tts_api_url:
            raise Exception("TTS API URL not configured. Please check environment variables.")
        
        headers = {
            "access-token": token
        }
        
        payload = {
            "text": text,
            "gender": gender
        }
        
        try:
            response = requests.post(tts_api_url, headers=headers, json=payload, verify=False)
            
            if response.status_code != 200:
                raise Exception(f"TTS API error (Status {response.status_code}): {response.text}")
            
            # For binary audio response
            content_type = response.headers.get("Content-Type", "")
            if "data" in content_type:
                return response.content
            # For JSON response with audio URL or content
            try:
                JsonResponse = response.json()
                data = JsonResponse["data"]
                print(f"DEBUG: TTS API Response: {data}")  # Debug logging

                if "s3_url" in data:
                    audio_response = requests.get(data["s3_url"], verify=False)
                    if audio_response.status_code == 200:
                        return audio_response.content
                    else:
                        raise Exception(f"Failed to download audio from URL: {audio_response.status_code}")
                        
                elif "audioContent" in data:
                    # If the response contains base64 audio content directly
                    import base64
                    return base64.b64decode(data["audioContent"])
                    
                elif "audio" in data:
                    # If the response contains audio data in another field
                    if isinstance(data["audio"], str):
                        import base64
                        return base64.b64decode(data["audio"])
                    else:
                        return data["audio"]
                        
                elif "data" in data and isinstance(data["data"], str):
                    # Some APIs return audio as base64 in a "data" field
                    import base64
                    return base64.b64decode(data["data"])
                    
                else:
                    # Return the raw response for debugging
                    raise Exception(f"Unexpected response format from TTS API. Response keys: {list(data.keys())}")
                    
            except ValueError as json_error:
                # Response is not JSON, might be raw audio
                return response.content
                
        except requests.RequestException as e:
            raise Exception(f"Error communicating with TTS API: {str(e)}")