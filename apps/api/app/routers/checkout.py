from fastapi import APIRouter, HTTPException
from app.schemas.checkout import CheckoutSessionRequest, CheckoutSessionResponse
from app.services.stripe_service import create_checkout_session
import stripe

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/session", response_model=CheckoutSessionResponse)
async def create_session(request: CheckoutSessionRequest):
    try:
        return await create_checkout_session(request)
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
