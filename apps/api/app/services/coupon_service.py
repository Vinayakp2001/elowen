from decimal import Decimal
from datetime import datetime
from sqlmodel import Session, select
from app.models.coupon import Coupon
from app.schemas.cart import CouponResponse


def validate_coupon(code: str, subtotal: Decimal, session: Session) -> CouponResponse:
    coupon = session.exec(select(Coupon).where(Coupon.code == code.upper())).first()

    if not coupon:
        return CouponResponse(valid=False, message="Coupon not found.")

    if not coupon.active:
        return CouponResponse(valid=False, message="This coupon is no longer active.")

    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return CouponResponse(valid=False, message="This coupon has expired.")

    if coupon.max_uses is not None and coupon.uses_count >= coupon.max_uses:
        return CouponResponse(valid=False, message="This coupon has reached its usage limit.")

    if coupon.discount_type == "percent":
        discount = subtotal * (coupon.discount_value / Decimal("100"))
        new_total = subtotal - discount
    else:
        discount = min(coupon.discount_value, subtotal)
        new_total = subtotal - discount

    return CouponResponse(
        valid=True,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        new_total=max(new_total, Decimal("0")),
    )
