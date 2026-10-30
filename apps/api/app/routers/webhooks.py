import logging
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.config import settings
from app.constants import SUCCESS_STATES, STATUS_RANK, SHIPROCKET_STATUS_MAP
from app.models.webhook import WebhookEvent
from app.models.order import Order
from app.services import phonepe_service
from app.services.order_service import promote_order_to_paid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/phonepe")
async def phonepe_webhook(request: Request, db: Session = Depends(get_session)):
    """
    PhonePe S2S callback.
    PhonePe sends { merchantOrderId: str, ... } in the JSON body.
    We verify state via the SDK, then promote the pre-created pending order.
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

    # Look up the pending order that was created before the redirect.
    order = db.exec(
        select(Order).where(Order.phonepe_order_id == merchant_order_id)
    ).first()

    if state == "COMPLETED":
        if not order:
            # No pending order to promote — never create an empty order.
            logger.error(
                "[Webhook] PhonePe COMPLETED for %s but no pending order found — acknowledging without create.",
                merchant_order_id,
            )
        elif order.status in SUCCESS_STATES:
            # Duplicate confirmation — fulfilment already ran. No-op.
            logger.info("[Webhook] PhonePe order %s already in success state %s — duplicate, no-op.",
                        merchant_order_id, order.status)
        else:
            promote_order_to_paid(order, status, db)
        webhook_event.processed = True
    else:
        # Non-COMPLETED: mark a still-pending order payment_failed; leave
        # success orders untouched.
        if order and order.status not in SUCCESS_STATES:
            order.status = "payment_failed"
            db.add(order)
        logger.info("[Webhook] PhonePe order %s state=%s — marked payment_failed (if pending).",
                    merchant_order_id, state)

    db.commit()
    return {"received": True}


@router.post("/shiprocket")
async def shiprocket_webhook(request: Request, db: Session = Depends(get_session)):
    """
    Shiprocket shipment-status webhook.

    Verifies a shared token, finds the order by AWB (then shiprocket_order_id),
    maps the Shiprocket status to our internal status, and applies it only as a
    forward transition. Unknown AWB → log + 200. Idempotent.
    """
    # Token verification (query param `token` or `X-Webhook-Token` header).
    provided = request.query_params.get("token") or request.headers.get("x-webhook-token", "")
    if not settings.shiprocket_webhook_token or provided != settings.shiprocket_webhook_token:
        raise HTTPException(status_code=401, detail="Unauthorized.")

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    awb = str(body.get("awb") or body.get("awb_code") or "").strip()
    sr_order_id = str(body.get("order_id") or body.get("channel_order_id") or "").strip()
    raw_status = str(
        body.get("current_status") or body.get("shipment_status") or body.get("status") or ""
    ).strip()

    # Find the order by AWB first, then by Shiprocket order id.
    order: Order | None = None
    if awb:
        order = db.exec(select(Order).where(Order.awb_code == awb)).first()
    if not order and sr_order_id:
        order = db.exec(select(Order).where(Order.shiprocket_order_id == sr_order_id)).first()

    if not order:
        logger.info("[Webhook] Shiprocket status for unknown awb=%s order_id=%s — acknowledging, no-op.",
                    awb, sr_order_id)
        return {"received": True}

    # Always persist the latest raw status + timestamp for UI display.
    order.shipment_status = raw_status or order.shipment_status
    order.shipment_status_at = datetime.utcnow()

    internal = SHIPROCKET_STATUS_MAP.get(raw_status.upper())
    if internal:
        current_rank = STATUS_RANK.get(order.status, 0)
        new_rank = STATUS_RANK.get(internal, 0)
        # Forward-only: never move backwards (e.g. delivered -> shipped).
        if new_rank > current_rank:
            order.status = internal
        else:
            logger.info("[Webhook] Shiprocket status %s (%s) not a forward transition from %s — status unchanged.",
                        raw_status, internal, order.status)
    else:
        logger.info("[Webhook] Shiprocket status %r has no internal mapping — storing raw only.", raw_status)

    db.add(order)
    db.commit()
    return {"received": True}
