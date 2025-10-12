import os
import requests
from dotenv import load_dotenv
from typing import Optional, Dict, List
import json
import base64

# Load environment variables
load_dotenv()

# Get token from environment variables
TOKEN = os.getenv("BASHINI_API_TOKEN")

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
        
        if not tts_api_url or not TOKEN:
            return {"error": "TTS API not configured for this language"}
        
        headers = {
            "Content-Type": "application/json",
            "access-token": TOKEN
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
            if "audio" in content_type:
                return response.content
            
            # For JSON response with audio URL or content
            try:
                data = response.json()
                return data["data"]["s3_url"]
                
            except ValueError:
                # Response is not JSON, might be raw audio
                return response.content
                
        except Exception as e:
            return {"error": f"TTS service error: {str(e)}"}

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

class TourismService:
    @staticmethod
    def get_emergency_phrases(language: str = "en"):
        """Get common emergency phrases in specified language"""
        phrases = {
            "en": [
                {"phrase": "Help!", "category": "emergency"},
                {"phrase": "I need a doctor", "category": "medical"},
                {"phrase": "Where is the hospital?", "category": "medical"},
                {"phrase": "Call the police", "category": "emergency"},
                {"phrase": "I'm lost", "category": "navigation"},
                {"phrase": "Can you help me?", "category": "general"},
                {"phrase": "I don't speak the local language", "category": "communication"}
            ]
        }
        return phrases.get(language, phrases["en"])
    
    @staticmethod
    def get_common_phrases(language: str = "en"):
        """Get common travel phrases in specified language"""
        phrases = {
            "en": [
                {"phrase": "Hello", "category": "greeting"},
                {"phrase": "Thank you", "category": "courtesy"},
                {"phrase": "Please", "category": "courtesy"},
                {"phrase": "Excuse me", "category": "courtesy"},
                {"phrase": "How much does this cost?", "category": "shopping"},
                {"phrase": "Where is the bathroom?", "category": "navigation"},
                {"phrase": "I would like to order", "category": "dining"},
                {"phrase": "Can I have the bill?", "category": "dining"}
            ]
        }
        return phrases.get(language, phrases["en"])