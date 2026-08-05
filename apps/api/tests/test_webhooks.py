"""
Tests for the Stripe webhook endpoint.

Covers:
- Invalid signature → 400
- Missing signature header → 400
- Duplicate event (already processed) → idempotent return
- Valid checkout.session.completed event → order_service called
- Non-checkout event → logged but not processed
"""

import json
from unittest.mock import patch, MagicMock

import stripe

from app.models.webhook import WebhookEvent


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _stripe_event(event_id="evt_test_001", event_type="checkout.session.completed"):
    """Build a mock Stripe event dict."""
    return {
        "id": event_id,
        "type": event_type,
        "data": {
            "object": {
                "id": "cs_test_session_001",
                "amount_total": 125000,
                "currency": "inr",
                "customer_details": {"email": "test@example.com"},
                "metadata": {
                    "user_id": "",
                    "coupon_code": "",
                    "items": "RING-001|Gold Ring|1|1250.00",
                    "email": "test@example.com",
                },
            }
        },
    }


# ---------------------------------------------------------------------------
# Invalid signature / webhook error tests
# ---------------------------------------------------------------------------

def test_invalid_signature_returns_400(client):
    """Stripe SignatureVerificationError → HTTP 400 with 'Invalid webhook signature.'"""
    with patch("stripe.Webhook.construct_event", side_effect=stripe.SignatureVerificationError(
        "Invalid signature", "bad"
    )):
        resp = client.post(
            "/webhooks/stripe",
            content=b"{}",
            headers={"stripe-signature": "bad-signature"},
        )

    assert resp.status_code == 400
    assert "Invalid webhook signature" in resp.json()["detail"]


def test_missing_signature_header_returns_400(client):
    """No stripe-signature header → construct_event raises → HTTP 400."""
    with patch("stripe.Webhook.construct_event", side_effect=Exception("No signature")):
        resp = client.post("/webhooks/stripe", content=b"{}", headers={})

    assert resp.status_code == 400
    assert resp.json()["detail"] == "Webhook error."


# ---------------------------------------------------------------------------
# Idempotency test
# ---------------------------------------------------------------------------

def test_duplicate_event_is_idempotent(client, db_session):
    """An already-processed event returns without reprocessing."""
    event = _stripe_event(event_id="evt_dup_001")

    # Pre-insert a processed webhook event
    existing = WebhookEvent(
        stripe_event_id="evt_dup_001",
        event_type="checkout.session.completed",
        processed=True,
        payload=dict(event),
    )
    db_session.add(existing)
    db_session.commit()

    with patch("stripe.Webhook.construct_event", return_value=event) as mock_construct, \
         patch("app.routers.webhooks.create_from_session") as mock_create:
        resp = client.post(
            "/webhooks/stripe",
            content=json.dumps(event).encode(),
            headers={"stripe-signature": "t=1,v1=valid"},
        )

    assert resp.status_code == 200
    assert resp.json() == {"received": True}
    # create_from_session should NOT be called for already-processed events
    mock_create.assert_not_called()


# ---------------------------------------------------------------------------
# Valid checkout.session.completed test
# ---------------------------------------------------------------------------

def test_valid_checkout_completed_calls_order_service(client):
    """A valid checkout.session.completed event triggers create_from_session."""
    event = _stripe_event(event_id="evt_valid_001")

    with patch("stripe.Webhook.construct_event", return_value=event), \
         patch("app.routers.webhooks.create_from_session") as mock_create:
        resp = client.post(
            "/webhooks/stripe",
            content=json.dumps(event).encode(),
            headers={"stripe-signature": "t=1,v1=valid"},
        )

    assert resp.status_code == 200
    assert resp.json() == {"received": True}
    # create_from_session should be called with the session data
    mock_create.assert_called_once()
    call_args = mock_create.call_args
    assert call_args.args[0]["id"] == "cs_test_session_001"


# ---------------------------------------------------------------------------
# Non-checkout event test
# ---------------------------------------------------------------------------

def test_non_checkout_event_logged_but_not_processed(client, db_session):
    """A non-checkout event is logged but create_from_session is not called."""
    event = _stripe_event(event_id="evt_other_001", event_type="payment_intent.created")

    with patch("stripe.Webhook.construct_event", return_value=event), \
         patch("app.routers.webhooks.create_from_session") as mock_create:
        resp = client.post(
            "/webhooks/stripe",
            content=json.dumps(event).encode(),
            headers={"stripe-signature": "t=1,v1=valid"},
        )

    assert resp.status_code == 200
    assert resp.json() == {"received": True}
    mock_create.assert_not_called()

    # Event should be logged in the DB (but not marked processed)
    from sqlmodel import select
    logged = db_session.exec(
        select(WebhookEvent).where(WebhookEvent.stripe_event_id == "evt_other_001")
    ).first()
    assert logged is not None
    assert logged.processed is False
    assert logged.event_type == "payment_intent.created"
