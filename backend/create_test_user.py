"""
Create a test user account in the database
"""
import bcrypt
from sqlmodel import Session, select
from app.database.db import get_engine, init_db
from app.database.models import User
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_test_user():
    """Create a test user account"""
    engine = get_engine()
    
    # Initialize database tables if they don't exist
    init_db()
    
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.exec(
            select(User).where(User.email == "test@example.com")
        ).first()
        
        if existing_user:
            print("✅ Test user already exists!")
            print(f"📧 Email: test@example.com")
            print(f"🔑 Password: password123")
            print(f"👤 Username: {existing_user.username}")
            print(f"🆔 User ID: {existing_user.id}")
            return
        
        # Create new test user
        hashed_password = hash_password("password123")
        
        test_user = User(
            email="test@example.com",
            username="testuser",
            password_hash=hashed_password,
            full_name="Test User",
            preferred_language="en",
            preferred_theme="light",
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        session.add(test_user)
        session.commit()
        session.refresh(test_user)
        
        print("✅ Test user created successfully!")
        print(f"\n📧 Email: test@example.com")
        print(f"🔑 Password: password123")
        print(f"👤 Username: testuser")
        print(f"🆔 User ID: {test_user.id}")
        print(f"\nYou can use these credentials to log in to the application.")

if __name__ == "__main__":
    create_test_user()
