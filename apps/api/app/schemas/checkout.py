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
    user_id: Optional[str] = None
    # Set true when the client requests Cash on Delivery.
    cod_requested: Optional[bool] = False
    # Contact
    email: Optional[str] = None
    phone: Optional[str] = None
    # Shipping
    shipping_name: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None


class PhonePePaymentResponse(BaseModel):
    order_id: str  # our merchantOrderId
    url: str       # PhonePe redirect URL


class CodOrderResponse(BaseModel):
    order_id: str  # our internal Order UUID
