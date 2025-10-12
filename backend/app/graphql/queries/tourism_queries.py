import strawberry
from typing import List, Optional
from ..types.tourism_types import (
    User, Language, LanguagesResponse, Place, DictionaryEntry, 
    TravelHistory, EmergencyContact, CultureTip, PhrasesResponse
)
from ...services.enhanced_tts import TranslationService, TourismService

@strawberry.type
class TourismQueries:
    @strawberry.field
    def get_supported_languages(self) -> LanguagesResponse:
        """Get all supported languages for translation and TTS"""
        languages_data = TranslationService.get_supported_languages()
        languages = [Language(code=lang["code"], name=lang["name"]) 
                    for lang in languages_data["languages"]]
        return LanguagesResponse(languages=languages)
    
    @strawberry.field
    def get_places(self, country: Optional[str] = None, 
                  category: Optional[str] = None, 
                  limit: int = 50) -> List[Place]:
        """Get places based on filters"""
        # This would query your database
        # For now, returning sample data
        sample_places = [
            Place(
                id=1,
                name="Taj Mahal",
                description="A symbol of love and one of the Seven Wonders of the World",
                country="India",
                state="Uttar Pradesh",
                city="Agra",
                latitude=27.1751,
                longitude=78.0421,
                category="monument",
                images=["taj_mahal_1.jpg", "taj_mahal_2.jpg"],
                languages_spoken=["hi", "en", "ur"],
                best_time_to_visit="October to March",
                entry_fee=50.0,
                rating=4.8
            ),
            Place(
                id=2,
                name="Red Fort",
                description="Historic fortified palace of the Mughal emperors",
                country="India",
                state="Delhi",
                city="New Delhi",
                latitude=28.6562,
                longitude=77.2410,
                category="monument",
                images=["red_fort_1.jpg"],
                languages_spoken=["hi", "en"],
                best_time_to_visit="October to March",
                entry_fee=35.0,
                rating=4.5
            )
        ]
        
        if country:
            sample_places = [p for p in sample_places if p.country.lower() == country.lower()]
        if category:
            sample_places = [p for p in sample_places if p.category == category]
            
        return sample_places[:limit]
    
    @strawberry.field
    def get_user_dictionary(self, user_id: int, 
                           language_from: Optional[str] = None,
                           language_to: Optional[str] = None) -> List[DictionaryEntry]:
        """Get user's personal dictionary entries"""
        # This would query your database
        # For now, returning sample data
        from datetime import datetime
        
        sample_entries = [
            DictionaryEntry(
                id=1,
                word="नमस्ते",
                translation="Hello",
                language_from="hi",
                language_to="en",
                pronunciation="namaste",
                usage_example="नमस्ते, आप कैसे हैं? (Hello, how are you?)",
                tags=["greeting", "common"],
                is_favorite=True,
                created_at=datetime.now()
            )
        ]
        
        return sample_entries
    
    @strawberry.field
    def get_travel_history(self, user_id: int) -> List[TravelHistory]:
        """Get user's travel history"""
        # This would query your database
        from datetime import datetime
        
        sample_history = [
            TravelHistory(
                id=1,
                destination="Goa",
                country="India",
                visit_date=datetime(2023, 12, 15),
                notes="Beautiful beaches and great seafood",
                photos=["goa_beach.jpg", "goa_sunset.jpg"],
                favorite_phrases=["Obrigado (Thank you in Portuguese)", "Susegad (Relaxed lifestyle)"],
                created_at=datetime.now()
            )
        ]
        
        return sample_history
    
    @strawberry.field
    def get_emergency_contacts(self, country: str) -> List[EmergencyContact]:
        """Get emergency contacts for a specific country"""
        # Sample data for India
        if country.lower() == "india":
            return [
                EmergencyContact(
                    id=1,
                    country="India",
                    service_type="police",
                    number="100",
                    description="Police Emergency"
                ),
                EmergencyContact(
                    id=2,
                    country="India",
                    service_type="ambulance",
                    number="102",
                    description="Ambulance Service"
                ),
                EmergencyContact(
                    id=3,
                    country="India",
                    service_type="fire",
                    number="101",
                    description="Fire Brigade"
                ),
                EmergencyContact(
                    id=4,
                    country="India",
                    service_type="tourist_helpline",
                    number="1363",
                    description="Tourist Helpline"
                )
            ]
        return []
    
    @strawberry.field
    def get_culture_tips(self, country: str, language: str = "en") -> List[CultureTip]:
        """Get cultural tips for a specific country"""
        # Sample data for India
        if country.lower() == "india":
            return [
                CultureTip(
                    id=1,
                    country="India",
                    tip_category="greeting",
                    tip_text="Namaste is a common greeting. Join palms together and bow slightly.",
                    language=language
                ),
                CultureTip(
                    id=2,
                    country="India",
                    tip_category="dining",
                    tip_text="Remove shoes when entering someone's home. Eating with hands is common.",
                    language=language
                ),
                CultureTip(
                    id=3,
                    country="India",
                    tip_category="customs",
                    tip_text="Dress modestly when visiting religious places. Cover shoulders and knees.",
                    language=language
                )
            ]
        return []
    
    @strawberry.field
    def get_emergency_phrases(self, language: str = "en") -> PhrasesResponse:
        """Get emergency phrases in specified language"""
        phrases = TourismService.get_emergency_phrases(language)
        return PhrasesResponse(phrases=phrases)
    
    @strawberry.field
    def get_common_phrases(self, language: str = "en") -> PhrasesResponse:
        """Get common travel phrases in specified language"""
        phrases = TourismService.get_common_phrases(language)
        return PhrasesResponse(phrases=phrases)