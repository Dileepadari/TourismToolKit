"""
Seed data for users table
"""
from sqlmodel import Session, select
from app.database.db import engine
from app.database.models import User
from datetime import datetime
import bcrypt

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_users():
    """Seed initial users into the database"""
    
    users_data = [
        {
            "email": "admin@tourismtoolkit.com",
            "username": "admin",
            "password": "admin123",  # Will be hashed
            "full_name": "Admin User",
            "preferred_language": "en",
            "preferred_theme": "light",
            "home_country": "India",
            "is_verified": True,
        },
        {
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123",  # Will be hashed
            "full_name": "Test User",
            "preferred_language": "en",
            "preferred_theme": "dark",
            "home_country": "India",
            "is_verified": True,
        },
        {
            "email": "demo@tourismtoolkit.com",
            "username": "demo",
            "password": "demo123",  # Will be hashed
            "full_name": "Demo User",
            "preferred_language": "hi",
            "preferred_theme": "light",
            "home_country": "India",
            "is_verified": True,
        },
        {
            "email": "john.doe@example.com",
            "username": "johndoe",
            "password": "johndoe123",  # Will be hashed
            "full_name": "John Doe",
            "preferred_language": "en",
            "preferred_theme": "dark",
            "home_country": "United States",
            "is_verified": True,
        },
        {
            "email": "tourist@india.com",
            "username": "tourist",
            "password": "tourist123",  # Will be hashed
            "full_name": "Tourist User",
            "preferred_language": "en",
            "preferred_theme": "light",
            "home_country": "United Kingdom",
            "is_verified": True,
        },
    ]
    
    with Session(engine) as session:
        # Check if users already exist
        existing_users = session.exec(select(User)).all()
        if existing_users:
            print(f"✓ Users table already has {len(existing_users)} users. Skipping seed.")
            return
        
        print("Seeding users...")
        created_count = 0
        
        for user_data in users_data:
            # Hash the password
            password = user_data.pop("password")
            hashed_password = hash_password(password)
            
            # Create user
            user = User(
                **user_data,
                password_hash=hashed_password,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            session.add(user)
            created_count += 1
            print(f"  - Created user: {user.username} ({user.email})")
        
        session.commit()
        print(f"✓ Successfully seeded {created_count} users")
        
        # Print credentials for reference
        print("\n" + "="*60)
        print("TEST USER CREDENTIALS:")
        print("="*60)
        for user_data in users_data:
            # Reconstruct the password (it was popped earlier)
            if user_data["username"] == "admin":
                password = "admin123"
            elif user_data["username"] == "testuser":
                password = "password123"
            elif user_data["username"] == "demo":
                password = "demo123"
            elif user_data["username"] == "johndoe":
                password = "johndoe123"
            elif user_data["username"] == "tourist":
                password = "tourist123"
            else:
                password = "********"
            
            print(f"Email: {user_data['email']:<30} Password: {password}")
        print("="*60 + "\n")

if __name__ == "__main__":
    seed_users()
