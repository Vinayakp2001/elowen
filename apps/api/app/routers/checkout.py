from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session

from app.database import get_session
from app.config import settings
from app.schemas.checkout import (
    CheckoutSessionRequest,
    PhonePePaymentResponse,
    CodOrderResponse,
)
from app.services import phonepe_service, order_service

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/session", response_model=PhonePePaymentResponse)
async def create_session(request: CheckoutSessionRequest, db: Session = Depends(get_session)):
    """Persist a `pending` order (items + shipping), THEN initiate PhonePe.

    The pending order and the PhonePe request share the same merchantOrderId so
    the webhook can later promote exactly this order to `paid`.
    """
    # Reject empty cart / non-positive total before touching the DB or PhonePe.
    if not request.items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    total = sum(item.unit_price * item.quantity for item in request.items)
    if total <= 0:
        raise HTTPException(status_code=400, detail="Invalid order total.")

    merchant_order_id = phonepe_service._generate_merchant_order_id()

    # 1. Persist the pending order first. On failure, do NOT call PhonePe.
    try:
        order_service.create_pending_online_order(request, merchant_order_id, db)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not create order: {str(e)}")

    # 2. Initiate payment using the SAME merchantOrderId.
    try:
        return await phonepe_service.initiate_payment(request, merchant_order_id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Payment initiation failed: {str(e)}")


@router.post("/cod", response_model=CodOrderResponse)
async def create_cod(request: CheckoutSessionRequest, db: Session = Depends(get_session)):
    """Create a Cash on Delivery order without a payment-gateway redirect.

    Per-product COD eligibility is gated on the client (public product data);
    the value cap — the abuse-prone control — is enforced here server-side.
    """
    # Validate items are well-formed and compute total.
    if not request.items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    total = sum(item.unit_price * item.quantity for item in request.items)
    if total <= 0:
        raise HTTPException(status_code=400, detail="Invalid order total.")

    # Enforce the configured COD value cap (0 = no cap).
    if settings.cod_max_value and total > settings.cod_max_value:
        raise HTTPException(
            status_code=400,
            detail=f"Cash on Delivery is not available for orders above ₹{settings.cod_max_value}.",
        )

    try:
        order = order_service.create_cod_order(request, db)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"COD order creation failed: {str(e)}")

    return CodOrderResponse(order_id=str(order.id))
