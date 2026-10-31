"""Read-only response schemas for the admin data-visibility endpoints.

These Pydantic models shape the SELECT-only admin listing/detail responses for
orders and newsletter signups. They never drive writes and own no tables.
"""
from pydantic import BaseModel
from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime
import uuid

from app.schemas.order import OrderItemOut


class OrderListItem(BaseModel):
    """Single row in the admin orders list (Requirement 1.2)."""

    id: uuid.UUID
    phonepe_order_id: Optional[str] = None
    status: str
    payment_method: str = "online"
    total_amount: Decimal
    currency: str
    customer_email: Optional[str] = None
    awb_code: Optional[str] = None
    shipment_status: Optional[str] = None
    created_at: datetime


class OrderPaymentOut(BaseModel):
    """Payment row shown in order detail."""

    amount: Optional[Decimal] = None
    status: Optional[str] = None
    phonepe_payment_id: Optional[str] = None
    created_at: datetime


class OrderDetail(OrderListItem):
    """Full order detail (Requirement 1.3) — extends the list item."""

    shipping_address: Optional[Any] = None
    shiprocket_order_id: Optional[str] = None
    shiprocket_shipment_id: Optional[str] = None
    courier_name: Optional[str] = None
    shipment_status_at: Optional[datetime] = None
    updated_at: datetime
    items: List[OrderItemOut] = []
    payments: List[OrderPaymentOut] = []


class OrderListResponse(BaseModel):
    """Paginated orders list envelope."""

    total: int
    page: int
    page_size: int
    orders: List[OrderListItem] = []


class NewsletterItem(BaseModel):
    """Single newsletter signup row (Requirement 2.2)."""

    email: str
    created_at: datetime


class NewsletterListResponse(BaseModel):
    """Paginated newsletter signups list envelope."""

    total: int
    page: int
    page_size: int
    signups: List[NewsletterItem] = []
