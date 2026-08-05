from pydantic import BaseModel
from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime
import uuid


class OrderItemOut(BaseModel):
    sku: str
    variant_key: Optional[str] = None
    product_name: str
    quantity: int
    unit_price: Decimal


class OrderOut(BaseModel):
    id: uuid.UUID
    stripe_session_id: str
    status: str
    total_amount: Decimal
    currency: str
    customer_email: Optional[str] = None
    shipping_address: Optional[Any] = None
    awb_code: Optional[str] = None
    courier_name: Optional[str] = None
    items: List[OrderItemOut]
    created_at: datetime
