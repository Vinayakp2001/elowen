"""Integration tests for the online (PhonePe) order lifecycle.

These guard the two bugs fixed on 30 Oct 2026:

1. A confirmed PhonePe payment must promote the pre-created pending order to
   `paid` and fire fulfilment (Shiprocket shipment + AWB). Previously the
   webhook built an empty order / never ran because confirmation was wired to a
   webhook PhonePe was never asked to call.

2. `_post_order_tasks` must fire correctly from the SYNC verify path (runs in a
   threadpool, no running event loop). The old `asyncio.create_task` raised
   `RuntimeError: no running event loop` there, so Shiprocket never ran and
   `awb_code` stayed null.

PhonePe, Shiprocket, and email are all mocked — no network, no real money.
"""
import time
from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.models.order import Order, OrderItem
from app.schemas.checkout import CheckoutSessionRequest, CheckoutItem
from app.services import order_service


def _make_request() -> CheckoutSessionRequest:
    return CheckoutSessionRequest(
        items=[CheckoutItem(sku="TEST-1", quantity=1, unit_price=Decimal("1"), product_name="Test Product")],
        email="buyer@example.com",
        phone="7852800216",
        shipping_name="Test Buyer",
        shipping_address="20-c indraprasth colony",
        shipping_city="Kota",
        shipping_state="Rajasthan",
        shipping_pincode="326519",
    )


def _completed_status(merchant_order_id: str):
    """Mimic the PhonePe SDK status object for a COMPLETED payment."""
    return SimpleNamespace(
        state="COMPLETED",
        order_id="PPORDER123",
        amount=100,  # paise -> ₹1
        payment_details=[SimpleNamespace(transaction_id="TXN123")],
    )


def test_pending_order_persists_items_and_shipping(session, test_engine):
    """Step 1 of the flow: a pending online order is saved with items + address
    BEFORE any payment (this is what makes a confirmed payment recoverable)."""
    req = _make_request()
    order = order_service.create_pending_online_order(req, "ELWTESTORDER0001", session)

    assert order.status == "pending"
    assert order.phonepe_order_id == "ELWTESTORDER0001"
    assert order.total_amount == Decimal("1")
    assert order.customer_email == "buyer@example.com"
    assert order.shipping_address["pincode"] == "326519"

    items = session.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    assert len(items) == 1
    assert items[0].product_sku == "TEST-1"


def test_promote_to_paid_fires_fulfilment_from_sync_context(session, test_engine, monkeypatch):
    """The core guard: promoting from the SYNC verify path must NOT crash on the
    event loop and MUST run Shiprocket fulfilment, persisting shipment ids."""
    # Create the pending order first.
    req = _make_request()
    order = order_service.create_pending_online_order(req, "ELWTESTORDER0002", session)

    # Fulfilment loads the order fresh via `from app.database import engine`
    # inside the function — so patch THAT module attribute (the function re-imports
    # it at call time). Point it at this test's file-based DB so the background
    # thread sees the order.
    import app.database as database
    monkeypatch.setattr(database, "engine", test_engine, raising=False)

    # Mock Shiprocket + email so no network is touched. Record that they ran.
    calls = {"shipment": False, "awb": False, "email": False}

    async def fake_create_shipment(payload):
        calls["shipment"] = True
        return {"order_id": "SR999", "shipment_id": "SH999"}

    async def fake_assign_awb(shipment_id):
        calls["awb"] = True
        return {"response": {"data": {"awb_code": "AWB123", "courier_name": "BlueDart"}}}

    async def fake_send_email(**kwargs):
        calls["email"] = True

    import app.services.shiprocket_service as sr
    import app.services.email_service as es
    monkeypatch.setattr(sr, "create_shipment", fake_create_shipment)
    monkeypatch.setattr(sr, "assign_awb", fake_assign_awb)
    monkeypatch.setattr(es, "send_order_confirmation", fake_send_email)
    monkeypatch.setattr(order_service, "_decrement_inventory", lambda skus: None)

    # Promote — this runs synchronously (like the threadpool verify path). Must
    # NOT raise RuntimeError: no running event loop.
    status = _completed_status("ELWTESTORDER0002")
    order_service.promote_order_to_paid(order, status, session)

    assert order.status == "paid"

    # Fulfilment runs in a daemon thread; give it a moment to complete.
    deadline = time.time() + 5
    while time.time() < deadline and not calls["awb"]:
        time.sleep(0.05)

    assert calls["shipment"], "Shiprocket create_shipment never ran"
    assert calls["awb"], "Shiprocket assign_awb never ran"

    refreshed = session.get(Order, order.id)
    session.refresh(refreshed)
    assert refreshed.shiprocket_order_id == "SR999"
    assert refreshed.awb_code == "AWB123"
    assert refreshed.status == "processing"
