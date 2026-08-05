from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session, select
import stripe
from app.config import settings
from app.database import get_session
from app.models.webhook import WebhookEvent
from app.services.order_service import create_from_session

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

stripe.api_key = settings.stripe_secret_key


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook error.")

    # Idempotency check
    existing = db.exec(
        select(WebhookEvent).where(WebhookEvent.stripe_event_id == event["id"])
    ).first()
    if existing and existing.processed:
        return {"received": True}

    # Log event
    webhook_event = existing or WebhookEvent(
        stripe_event_id=event["id"],
        event_type=event["type"],
        payload=dict(event),
    )
    db.add(webhook_event)
    db.flush()

    # Handle events
    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]
        create_from_session(session_data, db)
        webhook_event.processed = True

    db.commit()
    return {"received": True}
