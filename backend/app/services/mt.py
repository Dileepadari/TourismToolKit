import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class MachineTranslationService:
    """Service for translating text from one language to another using Bashini MT API"""

    @staticmethod
    def get_supported_languages():
        """Get list of supported languages for TTS"""
        return {
            "languages": [
                {"code": "te", "name": "Telugu"},
                {"code": "hi", "name": "Hindi"},
                {"code": "en", "name": "English"},
                {"code": "ta", "name": "Tamil"},
                {"code": "kn", "name": "Kannada"},
                # {"code": "ml", "name": "Malayalam"},
                # {"code": "bn", "name": "Bengali"},
                # {"code": "gu", "name": "Gujarati"},
                # {"code": "mr", "name": "Marathi"},
                # {"code": "pa", "name": "Punjabi"}
            ]
        }
    
    @staticmethod
    def get_api_token_url_for_language(source_lang: str, target_lang: str) -> tuple[str, str]:
        """Get the appropriate API URL and token for the specified language pair"""
        # Convert language codes to uppercase for environment variable format
        source_lang_code = source_lang.upper()
        target_lang_code = target_lang.upper()
        
        # Try language pair specific URL first
        api_env_var_name = f"BASHINI_MT_API_URL_{source_lang_code}_{target_lang_code}"
        api_url = os.getenv(api_env_var_name)
        
        # Try language pair specific token
        token_env_var_name = f"BASHINI_MT_API_TOKEN_{source_lang_code}_{target_lang_code}"
        token = os.getenv(token_env_var_name)
        
        # Fall back to default URL if language-specific URL not found
        if not api_url:
            api_url = os.getenv("BASHINI_MT_API_URL_DEFAULT")
            
        # Fall back to default token if language-specific token not found
        if not token:
            token = os.getenv("BASHINI_API_TOKEN_DEFAULT")
            
        return api_url, token
    
    @staticmethod
    def translate_text(text: str, source_lang: str, target_lang: str) -> str:
        """Translate text from source language to target language"""
        
        # Get the appropriate API URL for the specified language pair
        mt_api_url, token = MachineTranslationService.get_api_token_url_for_language(source_lang, target_lang)
        
        if not mt_api_url:
            raise Exception("MT API URL not configured. Please check environment variables.")
        
        headers = {
            "access-token": token,
        }
        
        payload = {
            "input_text": text
        }
        
        try:
            response = requests.post(mt_api_url, headers=headers, json=payload, verify=False)
            
            if response.status_code != 200:
                raise Exception(f"MT API error (Status {response.status_code}): {response.text}")
            
            json_response = response.json()
            
            # Extract translated text from response - adjust based on actual API response format
            if "data" in json_response and "output_text" in json_response["data"]:
                return json_response["data"]["output_text"]
            else:
                raise Exception(f"Unexpected response format from MT API: {json_response}")
                
        except requests.RequestException as e:
            raise Exception(f"Error communicating with MT API: {str(e)}")