from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal


class CheckoutItem(BaseModel):
    sku: str
    variant_key: Optional[str] = None
    quantity: int
    unit_price: Decimal
    product_name: str


class CheckoutSessionRequest(BaseModel):
    items: List[CheckoutItem]
    coupon_code: Optional[str] = None
    success_url: str
    cancel_url: str
    user_id: Optional[str] = None
    # Contact
    email: Optional[str] = None
    phone: Optional[str] = None
    # Shipping (flat fields from checkout form)
    shipping_name: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str
