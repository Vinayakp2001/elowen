from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal


class CartItemInput(BaseModel):
    sku: str
    variant_key: Optional[str] = None
    quantity: int
    unit_price: Decimal


class CartValidateRequest(BaseModel):
    items: List[CartItemInput]


class CartItemResult(BaseModel):
    sku: str
    available: bool
    current_price: Decimal
    price_changed: bool


class CartValidateResponse(BaseModel):
    valid: bool
    items: List[CartItemResult]


class CouponRequest(BaseModel):
    code: str
    subtotal: Decimal


class CouponResponse(BaseModel):
    valid: bool
    discount_type: Optional[str] = None
    discount_value: Optional[Decimal] = None
    new_total: Optional[Decimal] = None
    message: Optional[str] = None
