from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
import uuid


class Order(SQLModel, table=True):
    __tablename__: str = "orders"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    stripe_session_id: str = Field(unique=True, index=True)
    status: str = Field(default="pending")  # pending | paid | processing | shipped | delivered | cancelled
    customer_email: Optional[str] = Field(default=None, index=True)
    total_amount: Decimal = Field(decimal_places=2, max_digits=10)
    currency: str = Field(default="inr")
    shipping_address: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    shiprocket_order_id: Optional[str] = Field(default=None)
    shiprocket_shipment_id: Optional[str] = Field(default=None)
    awb_code: Optional[str] = Field(default=None)
    courier_name: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OrderItem(SQLModel, table=True):
    __tablename__: str = "order_items"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id")
    product_sku: str
    variant_key: Optional[str] = None
    quantity: int
    unit_price: Decimal = Field(decimal_places=2, max_digits=10)
    product_name: str


class Payment(SQLModel, table=True):
    __tablename__: str = "payments"

    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id")
    stripe_payment_id: Optional[str] = Field(default=None, unique=True)
    amount: Optional[Decimal] = Field(default=None, decimal_places=2, max_digits=10)
    status: Optional[str] = None  # succeeded | failed | refunded
    created_at: datetime = Field(default_factory=datetime.utcnow)
