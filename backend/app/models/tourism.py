from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Place(Base):
    __tablename__ = "places"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    country = Column(String, nullable=False)
    state = Column(String)
    city = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    category = Column(String)  # monument, temple, beach, etc.
    images = Column(JSON)  # Array of image URLs
    languages_spoken = Column(JSON)  # Array of languages
    best_time_to_visit = Column(String)
    entry_fee = Column(Float)
    rating = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

class Translation(Base):
    __tablename__ = "translations"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, nullable=False, index=True)
    language = Column(String, nullable=False)
    value = Column(Text, nullable=False)
    category = Column(String)  # UI, common_phrases, emergency, etc.
    created_at = Column(DateTime, server_default=func.now())

class EmergencyContacts(Base):
    __tablename__ = "emergency_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, nullable=False)
    service_type = Column(String, nullable=False)  # police, ambulance, fire, tourist_helpline
    number = Column(String, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

class CultureTips(Base):
    __tablename__ = "culture_tips"
    
    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, nullable=False)
    tip_category = Column(String, nullable=False)  # greeting, dining, customs, etc.
    tip_text = Column(Text, nullable=False)
    language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())