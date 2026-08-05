from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.schemas.cart import CartValidateRequest, CartValidateResponse, CouponRequest, CouponResponse
from app.services.cart_service import validate_cart
from app.services.coupon_service import validate_coupon

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/validate", response_model=CartValidateResponse)
async def validate_cart_endpoint(request: CartValidateRequest):
    return await validate_cart(request.items)


@router.post("/coupon", response_model=CouponResponse)
def apply_coupon(request: CouponRequest, session: Session = Depends(get_session)):
    return validate_coupon(request.code, request.subtotal, session)
