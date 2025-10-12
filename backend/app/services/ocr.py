import os
import requests
import base64
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import io
from PIL import Image

# Try to import pytesseract for fallback OCR
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("Warning: pytesseract not available. OCR will use Canvas API only.")

# Load environment variables
load_dotenv()

class OCRService:
    """OCR Service using Canvas API for multilingual text extraction"""
    
    # Language-specific OCR endpoints (URLs loaded from .env)
    OCR_ENDPOINTS = {
        "hi": os.getenv("BASHINI_OCR_API_URL_HI"),
        "kn": os.getenv("BASHINI_OCR_API_URL_KN"),
        "en": os.getenv("BASHINI_OCR_API_URL_EN"),
        "ml": os.getenv("BASHINI_OCR_API_URL_ML"),
        "bn": os.getenv("BASHINI_OCR_API_URL_BN"),
        "mr": os.getenv("BASHINI_OCR_API_URL_MR"),
        "te": os.getenv("BASHINI_OCR_API_URL_TE"),
        "pa": os.getenv("BASHINI_OCR_API_URL_PA"),
        "gu": os.getenv("BASHINI_OCR_API_URL_GU"),
        "ta": os.getenv("BASHINI_OCR_API_URL_TA"),
    }
    
    # Language-specific OCR tokens (loaded from .env)
    OCR_TOKENS = {
        "hi": os.getenv("BASHINI_OCR_API_TOKEN_HI"),
        "kn": os.getenv("BASHINI_OCR_API_TOKEN_KN"),
        "en": os.getenv("BASHINI_OCR_API_TOKEN_EN"),
        "ml": os.getenv("BASHINI_OCR_API_TOKEN_ML"),
        "bn": os.getenv("BASHINI_OCR_API_TOKEN_BN"),
        "mr": os.getenv("BASHINI_OCR_API_TOKEN_MR"),
        "te": os.getenv("BASHINI_OCR_API_TOKEN_TE"),
        "pa": os.getenv("BASHINI_OCR_API_TOKEN_PA"),
        "gu": os.getenv("BASHINI_OCR_API_TOKEN_GU"),
        "ta": os.getenv("BASHINI_OCR_API_TOKEN_TA"),
    }
    
    @staticmethod
    def get_supported_ocr_languages():
        """Get list of supported languages for OCR"""
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
    def extract_text_from_image(image_data: str, language: str = "en") -> Dict[str, Any]:
        """
        Extract text from image using Canvas OCR API
        
        Args:
            image_data: Base64 encoded image string
            language: Language code (en, hi, te, ta, kn, ml, bn, gu, mr, pa)
            
        Returns:
            Dictionary with extracted_text or error
        """
        # Get the appropriate endpoint for the language
        api_url = OCRService.OCR_ENDPOINTS.get(language)
        
        if not api_url:
            return {
                "success": False,
                "error": f"Unsupported language: {language}. Supported languages: {', '.join(OCRService.OCR_ENDPOINTS.keys())}"
            }
        
        # Get the token for the language
        access_token = OCRService.OCR_TOKENS.get(language)
        
        if not access_token:
            return {
                "success": False,
                "error": f"OCR token not configured for language: {language}"
            }
        
        # Prepare headers - use 'access-token' header (same as TTS API)
        # NO Content-Type for multipart/form-data (requests will set it)
        headers = {
            "access-token": access_token
        }
        
        # Remove data URL prefix if present (data:image/png;base64,...)
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        
        try:
            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)
            
            # Determine image format from the first few bytes
            if image_bytes.startswith(b'\xff\xd8\xff'):
                image_format = 'image/jpeg'
                filename = 'image.jpg'
            elif image_bytes.startswith(b'\x89PNG'):
                image_format = 'image/png'
                filename = 'image.png'
            else:
                # Default to JPEG
                image_format = 'image/jpeg'
                filename = 'image.jpg'
            
            # Create file-like object for the image
            # The API expects form-data with a file field
            files = {
                'file': (filename, image_bytes, image_format)
            }
            
            print(f"DEBUG: Calling OCR API for language: {language}")
            print(f"DEBUG: API URL: {api_url}")
            print(f"DEBUG: Sending file as form-data: {filename} ({len(image_bytes)} bytes)")
            
            # Make the API request with form-data
            response = requests.post(
                api_url,
                files=files,
                headers=headers,
                verify=False,  # Disable SSL verification for canvas.iiit.ac.in
                timeout=30
            )
            
            print(f"DEBUG: OCR API Response Status: {response.status_code}")
            print(f"DEBUG: OCR API Response Text: {response.text[:500]}")  # First 500 chars
            
            if response.status_code == 200:
                data = response.json()
                print(f"DEBUG: OCR API Full Response: {data}")
                
                # Expected format: {"status": "...", "message": "...", "data": {"decoded_text": "..."}, "error": null, "code": 200}
                extracted_text = ""
                
                if isinstance(data, dict):
                    # Check for the expected response format
                    if data.get("status") == "success" or data.get("code") == 200:
                        # Extract text from data.decoded_text
                        if "data" in data and isinstance(data["data"], dict):
                            extracted_text = data["data"].get("decoded_text", "")
                        # Fallback to other possible fields
                        if not extracted_text:
                            extracted_text = data.get("text", data.get("decoded_text", ""))
                    else:
                        # API returned 200 but with error status
                        return {
                            "success": False,
                            "error": data.get("message", "OCR processing failed")
                        }
                elif isinstance(data, list) and len(data) > 0:
                    # Handle array response
                    result = data[0]
                    if isinstance(result, dict):
                        extracted_text = result.get("decoded_text", result.get("text", ""))
                    elif isinstance(result, str):
                        extracted_text = result
                
                return {
                    "success": True,
                    "extracted_text": extracted_text,
                    "language": language
                }
            else:
                error_message = f"OCR API error: {response.status_code}"
                try:
                    error_data = response.json()
                    error_message += f" - {error_data}"
                except:
                    error_message += f" - {response.text}"
                
                return {
                    "success": False,
                    "error": error_message
                }
                
        except requests.Timeout:
            return {
                "success": False,
                "error": "OCR API request timeout. Please try again."
            }
        except requests.RequestException as e:
            return {
                "success": False,
                "error": f"OCR service connection error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"OCR service error: {str(e)}"
            }
