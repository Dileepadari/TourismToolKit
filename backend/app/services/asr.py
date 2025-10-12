import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AudioSpeechRecognitionService:
    @staticmethod
    def get_supported_languages():
        """Get list of supported languages for ASR"""
        return {
            "languages": [
                {"code": "hi", "name": "Hindi"},
                {"code": "en", "name": "English"},
                {"code": "gu", "name": "Gujarati"},
                {"code": "mr", "name": "Marathi"},
                # Add other supported languages as needed
            ]
        }
    
    @staticmethod
    def get_api_token_url_for_language(language: str):
        """Get the appropriate API and token URL for the specified language"""
        # Convert language code to uppercase for environment variable format
        language_code = language.upper()
        
        # Get the language-specific URL or fall back to default
        api_env_var_name = f"BASHINI_ASR_API_URL_{language_code}"
        print(f"DEBUG: Looking for env var {api_env_var_name}")  # Debug logging
        api_url = os.getenv(api_env_var_name)
        token_env_var_name = f"BASHINI_API_TOKEN_{language_code}"
        print(f"DEBUG: Looking for env var {token_env_var_name}")  # Debug logging
        token = os.getenv(token_env_var_name)

        if not api_url:
            # Fall back to default URL if language-specific URL not found
            api_url = os.getenv("BASHINI_ASR_API_URL_DEFAULT")
            
        return api_url, token
    
    @staticmethod
    def recognize_speech(audio_file, language: str = "en"):
        """Perform speech recognition on audio file using Bashini ASR API"""
        
        # Get the appropriate API URL for the specified language
        asr_api_url, token = AudioSpeechRecognitionService.get_api_token_url_for_language(language)
        
        if not asr_api_url:
            raise Exception("ASR API URL not configured. Please check environment variables.")
        
        headers = {
            "access-token": token
        }
        
        try:
            # Prepare file for upload
            files = {
                "audio_file": (audio_file.filename, audio_file, "audio/wav")
            }
            
            response = requests.post(asr_api_url, headers=headers, files=files, verify=False)
            
            if response.status_code != 200:
                raise Exception(f"ASR API error (Status {response.status_code}): {response.text}")
            
            # Process the response
            try:
                response_data = response.json()
                print(f"DEBUG: ASR API Response: {response_data}")  # Debug logging
                
                if "data" in response_data and "recognized_text" in response_data["data"]:
                    return response_data["data"]["recognized_text"]
                elif "data" in response_data and "text" in response_data["data"]:
                    return response_data["data"]["text"]
                else:
                    # Return error if the expected fields aren't found
                    raise Exception(f"Unexpected response format from ASR API. Response: {response_data}")
                    
            except ValueError as json_error:
                raise Exception(f"Invalid JSON response from ASR API: {str(json_error)}")
                
        except requests.RequestException as e:
            raise Exception(f"Error communicating with ASR API: {str(e)}")
