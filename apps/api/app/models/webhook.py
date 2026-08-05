from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
import uuid


class WebhookEvent(SQLModel, table=True):
    __tablename__: str = "webhook_events"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    stripe_event_id: str = Field(unique=True, index=True)
    event_type: str
    processed: bool = Field(default=False)
    payload: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    received_at: datetime = Field(default_factory=datetime.utcnow)

