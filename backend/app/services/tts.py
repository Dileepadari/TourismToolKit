import os
import requests
from dotenv import load_dotenv
from typing import Optional
from langdetect import detect, LangDetectException

# Load environment variables
load_dotenv()

TOKEN = os.getenv("BASHINI_API_TOKEN_DEFAULT")

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
    def generate_speech(text: str, gender: str, language: Optional[str] = None):
        """Generate speech audio from text using Bashini TTS API"""
        # If language not provided, try to detect from the text
        if language is None:
            try:
                if not text or not text.strip():
                    raise LangDetectException("Empty text")
                language = detect(text)
                print(f"DEBUG: Detected language '{language}' from text")
            except LangDetectException:
                # Fallback to English if detection fails
                print("DEBUG: Language detection failed or insufficient data; falling back to 'en'")
                language = "en"

        # Normalize potential language tags (e.g., 'zh-cn' -> 'zh') and ensure supported
        language = (language or "en").split("-")[0]
        supported_codes = {l["code"] for l in TextToSpeechService.get_supported_languages()["languages"]}
        if language not in supported_codes:
            print(f"DEBUG: Detected language '{language}' not in supported list; falling back to 'en'")
            language = "en"

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

                if "data" in data and "s3_url" in data["data"]:
                    audio_response = requests.get(data["data"]["s3_url"], verify=False)
                    if audio_response.status_code == 200:
                        return audio_response.content
                    else:
                        raise Exception(f"Failed to download audio from URL: {audio_response.status_code}")
                        
                elif "s3_url" in data:
                    audio_response = requests.get(data["s3_url"], verify=False)
                    # print(data["s3_url"])
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
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"TTS generation failed: {str(e)}")


class TranslationService:
    @staticmethod
    def get_supported_languages():
        """Get list of supported languages for translation"""
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
                {"code": "pa", "name": "Punjabi"},
                {"code": "ur", "name": "Urdu"},
                {"code": "as", "name": "Assamese"},
                {"code": "or", "name": "Odia"}
            ]
        }
    
    @staticmethod
    def translate_text(text: str, source_lang: str, target_lang: str):
        """Translate text from source language to target language"""
        api_url = os.getenv("BASHINI_TRANSLATION_API_URL")
        
        if not api_url or not TOKEN:
            return {"error": "Translation API not configured"}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}"
        }
        
        payload = {
            "input": [{"source": text}],
            "config": {
                "language": {
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang
                }
            }
        }
        
        try:
            response = requests.post(api_url, json=payload, headers=headers, verify=False)
            
            if response.status_code == 200:
                data = response.json()
                if "output" in data and len(data["output"]) > 0:
                    return {"translated_text": data["output"][0]["target"]}
                else:
                    return {"error": "Translation failed - no output received"}
            else:
                return {"error": f"Translation API error: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Translation service error: {str(e)}"}

class OCRService:
    @staticmethod
    def extract_text_from_image(image_data: str, language: str = "en"):
        """Extract text from image using OCR"""
        api_url = os.getenv("BASHINI_OCR_API_URL")
        
        if not api_url or not TOKEN:
            return {"error": "OCR API not configured"}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}"
        }
        
        payload = {
            "image": image_data,  # Base64 encoded image
            "config": {
                "language": language
            }
        }
        
        try:
            response = requests.post(api_url, json=payload, headers=headers, verify=False)
            
            if response.status_code == 200:
                data = response.json()
                return {"extracted_text": data.get("text", "")}
            else:
                return {"error": f"OCR API error: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"OCR service error: {str(e)}"}

class SpeechToTextService:
    @staticmethod
    def transcribe_audio(audio_data: str, language: str = "en"):
        """Convert speech to text"""
        api_url = os.getenv("BASHINI_STT_API_URL")
        
        if not api_url or not TOKEN:
            return {"error": "Speech-to-text API not configured"}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}"
        }
        
        payload = {
            "audio": audio_data,  # Base64 encoded audio
            "config": {
                "language": language
            }
        }
        
        try:
            response = requests.post(api_url, json=payload, headers=headers, verify=False)
            
            if response.status_code == 200:
                data = response.json()
                return {"transcribed_text": data.get("text", "")}
            else:
                return {"error": f"STT API error: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"STT service error: {str(e)}"}
                
        except requests.RequestException as e:
            raise Exception(f"Error communicating with TTS API: {str(e)}")