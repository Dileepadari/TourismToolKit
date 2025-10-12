import jwt
import bcrypt
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session, select
from ..database.db import get_db_session
from ..database.models import User
import os

class AuthService:
    SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24  # 30 days
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_user(email: str, username: str, password: str, **kwargs) -> Optional[User]:
        """Create a new user"""
        try:
            with get_db_session() as session:
                # Check if user already exists
                existing_user = session.exec(
                    select(User).where((User.email == email) | (User.username == username))
                ).first()
                
                if existing_user:
                    return None
                
                # Create new user
                user = User(
                    email=email,
                    username=username,
                    password_hash=AuthService.hash_password(password),
                    **kwargs
                )
                
                session.add(user)
                session.commit()
                session.refresh(user)
                return user
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        try:
            with get_db_session() as session:
                user = session.exec(
                    select(User).where(User.email == email)
                ).first()
                
                if user and AuthService.verify_password(password, user.password_hash):
                    return user
                return None
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return None
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """Get user by ID"""
        try:
            with get_db_session() as session:
                return session.get(User, user_id)
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def generate_verification_token() -> str:
        """Generate email verification token"""
        return secrets.token_urlsafe(32)