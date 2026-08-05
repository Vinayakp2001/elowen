from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Wishlist(SQLModel, table=True):
    __tablename__: str = "wishlists"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WishlistItem(SQLModel, table=True):
    __tablename__: str = "wishlist_items"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    wishlist_id: uuid.UUID = Field(foreign_key="wishlists.id")
    product_sku: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

