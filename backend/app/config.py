import os

class Config:
    # Database configuration - Use SQLite for development, PostgreSQL for production
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tourism_db.sqlite")
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # CORS configuration
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
