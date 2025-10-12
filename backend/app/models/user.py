from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import bcrypt

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(String)
    preferred_language = Column(String, default="en")
    preferred_theme = Column(String, default="light")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Tourism specific fields
    home_country = Column(String)
    travel_preferences = Column(JSON)  # Store preferences as JSON
    emergency_contacts = Column(JSON)
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))
    
    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

class UserDictionary(Base):
    __tablename__ = "user_dictionaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    word = Column(String, nullable=False)
    translation = Column(String, nullable=False)
    language_from = Column(String, nullable=False)
    language_to = Column(String, nullable=False)
    pronunciation = Column(String)
    usage_example = Column(Text)
    tags = Column(JSON)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class TravelHistory(Base):
    __tablename__ = "travel_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    destination = Column(String, nullable=False)
    country = Column(String, nullable=False)
    visit_date = Column(DateTime)
    notes = Column(Text)
    photos = Column(JSON)  # Store photo URLs
    favorite_phrases = Column(JSON)  # Store learned phrases from this trip
    created_at = Column(DateTime, server_default=func.now())