import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple

import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext

from app.models.user import User
from app.schemas.auth import TokenData
from app.services.user_service import get_user_by_email


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against
        
    Returns:
        True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate a hash for a given password.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        The hashed password
    """
    return pwd_context.hash(password)


def authenticate_user(email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_csrf_token() -> str:
    """
    Generate a CSRF protection token.
    
    Returns:
        A secure random token string
    """
    return secrets.token_urlsafe(32)


def verify_csrf_token(request_token: str, session_token: str) -> bool:
    """
    Verify a CSRF token against the session token.
    
    Args:
        request_token: Token sent with the request
        session_token: Token stored in the session
        
    Returns:
        True if tokens match, False otherwise
    """
    try:
        return hmac.compare_digest(request_token, session_token)
    except Exception:
        return False


def validate_reset_token(token: str) -> Optional[str]:
    """
    Validate a password reset token.
    
    Args:
        token: The reset token to validate
        
    Returns:
        User ID if token is valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "reset":
            return None
            
        return user_id
    except jwt.PyJWTError:
        return None


def create_reset_token(user_id: str) -> str:
    """
    Create a password reset token for a user.
    
    Args:
        user_id: The ID of the user requesting reset
        
    Returns:
        Encoded JWT reset token
    """
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {
        "sub": user_id,
        "type": "reset",
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def register_user(email: str, password: str) -> User:
    """
    Register a new user.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        Created user object
        
    Raises:
        HTTPException: If email already exists
    """
    from app.services.user_service import create_user
    
    # Check if user already exists
    existing_user = get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(password)
    user = await create_user(email=email, hashed_password=hashed_password)
    return user


async def login_user(email: str, password: str) -> Tuple[str, str]:
    """
    Log in a user and generate access token.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        Tuple of (access_token, token_type)
        
    Raises:
        HTTPException: If credentials are invalid
    """
    user = authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return access_token, "bearer"