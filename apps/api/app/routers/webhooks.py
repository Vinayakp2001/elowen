import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.webhook import WebhookEvent
from app.services import phonepe_service
from app.services.order_service import create_from_phonepe_callback

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/phonepe")
async def phonepe_webhook(request: Request, db: Session = Depends(get_session)):
    """
    PhonePe S2S callback.
    PhonePe sends { merchantOrderId: str, ... } in the JSON body.
    We verify state via SDK before creating the order.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    merchant_order_id: str = body.get("merchantOrderId", "")
    if not merchant_order_id:
        raise HTTPException(status_code=400, detail="Missing merchantOrderId.")

    # Idempotency check — skip if already processed
    existing = db.exec(
        select(WebhookEvent).where(WebhookEvent.gateway_event_id == merchant_order_id)
    ).first()
    if existing and existing.processed:
        logger.info("[Webhook] Duplicate PhonePe callback ignored: %s", merchant_order_id)
        return {"received": True}

    # Verify payment state with PhonePe
    try:
        status = phonepe_service.get_order_status(merchant_order_id)
    except Exception as e:
        logger.error("[Webhook] Failed to fetch PhonePe status for %s: %s", merchant_order_id, str(e))
        raise HTTPException(status_code=502, detail="Failed to verify payment status.")

    state = getattr(status, "state", None) or vars(status).get("state")

    # Log the event regardless of state
    webhook_event = existing or WebhookEvent(
        gateway_event_id=merchant_order_id,
        gateway="phonepe",
        event_type=f"PAYMENT_{state}",
        payload=body,
    )
    db.add(webhook_event)
    db.flush()

    if state == "COMPLETED":
        # Pass checkout metadata stored in webhook body (frontend sends it alongside)
        metadata = body.get("metadata", {})
        create_from_phonepe_callback(merchant_order_id, status, metadata, db)
        webhook_event.processed = True
    else:
        logger.info("[Webhook] PhonePe order %s state=%s — skipping order creation.", merchant_order_id, state)

    db.commit()
    return {"received": True}
