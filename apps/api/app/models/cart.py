from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
import uuid


class Cart(SQLModel, table=True):
    __tablename__: str = "carts"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CartItem(SQLModel, table=True):
    __tablename__: str = "cart_items"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    cart_id: uuid.UUID = Field(foreign_key="carts.id")
    product_sku: str
    variant_key: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal = Field(decimal_places=2, max_digits=10)

