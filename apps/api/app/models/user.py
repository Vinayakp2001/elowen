from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class User(SQLModel, table=True):
    __tablename__: str = "users"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    password_hash: Optional[str] = Field(default=None)          # null for OAuth-only users
    google_id: Optional[str] = Field(default=None, unique=True, index=True)
    avatar_url: Optional[str] = Field(default=None)
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
