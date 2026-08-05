from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class NewsletterSignup(SQLModel, table=True):
    __tablename__: str = "newsletter_signups"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

