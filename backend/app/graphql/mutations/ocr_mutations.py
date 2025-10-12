import strawberry
from typing import Optional
from app.services.ocr import OCRService

@strawberry.type
class OCRResponse:
    success: bool
    message: Optional[str] = None
    extracted_text: Optional[str] = None
    language: Optional[str] = None
    error: Optional[str] = None

@strawberry.input
class OCRInput:
    image_data: str  # Base64 encoded image
    language: str = "en"  # Default to English

@strawberry.mutation
def extract_text_from_image(input: OCRInput) -> OCRResponse:
    """Extract text from image using OCR"""
    try:
        result = OCRService.extract_text_from_image(
            image_data=input.image_data,
            language=input.language
        )
        
        if result.get("success"):
            return OCRResponse(
                success=True,
                message="Text extracted successfully",
                extracted_text=result.get("extracted_text", ""),
                language=result.get("language")
            )
        else:
            return OCRResponse(
                success=False,
                message="Failed to extract text",
                error=result.get("error", "Unknown error")
            )
            
    except Exception as e:
        return OCRResponse(
            success=False,
            message=f"Error extracting text: {str(e)}",
            error=str(e)
        )

OCRMutations = [
    extract_text_from_image
]
