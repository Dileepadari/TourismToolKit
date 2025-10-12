import strawberry
from typing import List
from app.services.ocr import OCRService

@strawberry.type
class OCRLanguage:
    code: str
    name: str

@strawberry.type
class OCRLanguagesResponse:
    languages: List[OCRLanguage]

@strawberry.field
def supported_ocr_languages() -> OCRLanguagesResponse:
    """Get list of supported languages for OCR"""
    languages_data = OCRService.get_supported_ocr_languages()
    
    languages = [
        OCRLanguage(code=lang["code"], name=lang["name"])
        for lang in languages_data["languages"]
    ]
    
    return OCRLanguagesResponse(languages=languages)

OCRQueries = [
    supported_ocr_languages
]
