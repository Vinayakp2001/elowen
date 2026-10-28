from fastapi import APIRouter, HTTPException
from app.schemas.checkout import CheckoutSessionRequest, PhonePePaymentResponse
from app.services import phonepe_service

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/session", response_model=PhonePePaymentResponse)
async def create_session(request: CheckoutSessionRequest):
    try:
        return await phonepe_service.initiate_payment(request)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Payment initiation failed: {str(e)}")
