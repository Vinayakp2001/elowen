from datetime import datetime, timedelta
from typing import Optional
import uuid

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: uuid.UUID, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def get_user_by_email(email: str, db: Session) -> Optional[User]:
    return db.exec(select(User).where(User.email == email)).first()


def get_user_by_id(user_id: uuid.UUID, db: Session) -> Optional[User]:
    return db.get(User, user_id)


def register_user(email: str, password: str, name: Optional[str], db: Session) -> User:
    user = User(
        email=email.lower().strip(),
        name=name,
        password_hash=hash_password(password),
        is_verified=False,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(email: str, password: str, db: Session) -> Optional[User]:
    user = get_user_by_email(email.lower().strip(), db)
    if not user:
        return None
    if not user.password_hash:
        return None  # OAuth-only account
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user


def get_or_create_google_user(
    google_id: str,
    email: str,
    name: Optional[str],
    avatar_url: Optional[str],
    db: Session,
) -> User:
    # Check by google_id first
    existing = db.exec(select(User).where(User.google_id == google_id)).first()
    if existing:
        return existing

    # Check if email already exists (link accounts)
    existing_by_email = get_user_by_email(email, db)
    if existing_by_email:
        existing_by_email.google_id = google_id
        existing_by_email.is_verified = True
        if avatar_url and not existing_by_email.avatar_url:
            existing_by_email.avatar_url = avatar_url
        existing_by_email.updated_at = datetime.utcnow()
        db.add(existing_by_email)
        db.commit()
        db.refresh(existing_by_email)
        return existing_by_email

    # Create new user
    user = User(
        email=email.lower().strip(),
        name=name,
        google_id=google_id,
        avatar_url=avatar_url,
        is_verified=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
