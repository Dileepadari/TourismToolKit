from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import bcrypt

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    password_hash: str
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    preferred_language: str = Field(default="en")
    preferred_theme: str = Field(default="light")
    home_country: Optional[str] = None
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    # Relationships
    dictionary_entries: List["DictionaryEntry"] = Relationship(back_populates="user")
    travel_history: List["TravelHistory"] = Relationship(back_populates="user")
    
    def set_password(self, password: str):
        """Hash and set password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

class DictionaryEntry(SQLModel, table=True):
    __tablename__ = "dictionary_entries"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    word: str
    translation: str
    language_from: str
    language_to: str
    pronunciation: Optional[str] = None
    usage_example: Optional[str] = None
    tags: Optional[str] = None  # JSON string of tags
    is_favorite: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="dictionary_entries")

class TravelHistory(SQLModel, table=True):
    __tablename__ = "travel_history"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    destination: str
    country: str
    visit_date: datetime
    notes: Optional[str] = None
    photos: Optional[str] = None  # JSON string of photo URLs
    favorite_phrases: Optional[str] = None  # JSON string of phrases
    rating: Optional[float] = Field(default=None, ge=1, le=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="travel_history")

class Place(SQLModel, table=True):
    __tablename__ = "places"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    country: str
    state: Optional[str] = None
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    images: Optional[str] = None  # JSON string of image URLs
    languages_spoken: Optional[str] = None  # JSON string of language codes
    best_time_to_visit: Optional[str] = None
    entry_fee: Optional[float] = None
    rating: Optional[float] = Field(default=None, ge=1, le=5)
    cultural_info: Optional[str] = None
    emergency_contacts: Optional[str] = None  # JSON string
    local_customs: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EmergencyContact(SQLModel, table=True):
    __tablename__ = "emergency_contacts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    country: str
    service_type: str  # police, medical, fire, tourist_helpline
    number: str
    description: Optional[str] = None
    is_active: bool = Field(default=True)

class CultureTip(SQLModel, table=True):
    __tablename__ = "culture_tips"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    country: str
    tip_category: str  # etiquette, customs, food, clothing, etc.
    tip_text: str
    language: str = Field(default="en")
    importance: str = Field(default="medium")  # low, medium, high
    created_at: datetime = Field(default_factory=datetime.utcnow)