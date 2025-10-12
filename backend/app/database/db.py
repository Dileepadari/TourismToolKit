from sqlmodel import create_engine, SQLModel, Session
from .models import User, DictionaryEntry, TravelHistory, Place, EmergencyContact, CultureTip
from ..config import Config

# Use configuration from config module
DATABASE_URL = Config.DATABASE_URL

# Create engine with appropriate settings
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, echo=True)

def create_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)

def init_db():
    """Initialize database - alias for create_tables"""
    create_tables()

def get_engine():
    """Get database engine"""
    return engine

def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session

def get_db_session():
    """Get database session for direct use"""
    return Session(engine)
