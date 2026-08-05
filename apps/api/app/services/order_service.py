import asyncio
import logging
import os
import sqlite3
from decimal import Decimal
from sqlmodel import Session, select
from app.models.order import Order, OrderItem, Payment
import uuid

logger = logging.getLogger(__name__)

PAYLOAD_DB_PATH = os.getenv(
    "PAYLOAD_DB_PATH",
    os.path.join(os.path.dirname(__file__), "../../../web/payload.db"),
)


def _decrement_inventory(skus: list[str]) -> None:
    """Set inStock = false in Payload SQLite for purchased SKUs."""
    try:
        db_path = os.path.abspath(PAYLOAD_DB_PATH)
        if not os.path.exists(db_path):
            logger.warning("[Inventory] payload.db not found at %s", db_path)
            return
        conn = sqlite3.connect(db_path)
        conn.execute(
            f"UPDATE products SET in_stock = 0 WHERE sku IN ({','.join('?' for _ in skus)})",
            skus,
        )
        conn.commit()
        conn.close()
        logger.info("[Inventory] Marked out of stock: %s", skus)
    except Exception as e:
        logger.error("[Inventory] Failed to update stock: %s", str(e))


def create_from_session(stripe_session: dict, db: Session) -> Order:
    """Create Order, OrderItems, and Payment from a completed Stripe session."""
    session_id = stripe_session["id"]
    metadata = stripe_session.get("metadata", {})

    # Parse items from metadata: "sku:name:qty:price,..."
    items_data = _parse_items_metadata(metadata.get("items", ""), metadata.get("skus", ""))

    total = Decimal(str(stripe_session.get("amount_total", 0))) / 100
    currency = stripe_session.get("currency", "inr")
    customer_email = stripe_session.get("customer_details", {}).get("email") or metadata.get("email", "")

    # Parse shipping address from Stripe or metadata
    shipping_address = _parse_shipping_address(stripe_session, metadata)

    order = Order(
        stripe_session_id=session_id,
        status="paid",
        total_amount=total,
        currency=currency,
        customer_email=customer_email,
        shipping_address=shipping_address,
        user_id=uuid.UUID(metadata["user_id"]) if metadata.get("user_id") else None,
    )
    db.add(order)
    db.flush()

    for item in items_data:
        db.add(OrderItem(
            order_id=order.id,
            product_sku=item["sku"],
            product_name=item.get("name", item["sku"]),
            quantity=item["quantity"],
            unit_price=Decimal(str(item.get("price", total / max(len(items_data), 1)))),
        ))

    payment = Payment(
        order_id=order.id,
        stripe_payment_id=stripe_session.get("payment_intent"),
        amount=total,
        status="succeeded",
    )
    db.add(payment)
    db.commit()
    db.refresh(order)

    # Trigger post-payment async tasks (Shiprocket + email)
    # Run in background — do not block webhook response
    asyncio.create_task(_post_payment_tasks(order, items_data, db))

    return order


async def _post_payment_tasks(order: Order, items_data: list, db: Session):
    """Async post-payment: decrement inventory, create Shiprocket shipment, send confirmation email."""
    from app.services.shiprocket_service import build_shiprocket_order, create_shipment, assign_awb
    from app.services.email_service import send_order_confirmation

    shipping_address = order.shipping_address or {}

    # 1. Decrement inventory for purchased SKUs
    skus = [item["sku"] for item in items_data if item.get("sku")]
    if skus:
        _decrement_inventory(skus)

    # 2. Create Shiprocket shipment
    try:
        sr_payload = build_shiprocket_order(order, _get_order_items_for_sr(order, items_data), shipping_address)
        sr_response = await create_shipment(sr_payload)
        shipment_id = str(sr_response.get("shipment_id", ""))

        if shipment_id:
            awb_response = await assign_awb(shipment_id)
            awb_data = awb_response.get("response", {}).get("data", {})
            awb_code = awb_data.get("awb_code", "")
            courier_name = awb_data.get("courier_name", "")

            # Update order with shipment info
            from app.database import engine
            from sqlmodel import Session as DBSession
            with DBSession(engine) as session:
                db_order = session.get(Order, order.id)
                if db_order:
                    db_order.shiprocket_shipment_id = shipment_id
                    db_order.awb_code = awb_code
                    db_order.courier_name = courier_name
                    db_order.status = "processing"
                    session.add(db_order)
                    session.commit()
    except Exception as e:
        logger.error("[Shiprocket] Failed to create shipment for order %s: %s", order.id, str(e))

    # 3. Send order confirmation email
    if order.customer_email:
        try:
            await send_order_confirmation(
                to=order.customer_email,
                order_id=str(order.id),
                items=[
                    {
                        "name": item.get("name", item["sku"]),
                        "quantity": item["quantity"],
                        "price": float(item.get("price", 0)),
                    }
                    for item in items_data
                ],
                total=float(order.total_amount),
                shipping_address=order.shipping_address or {},
            )
        except Exception as e:
            logger.error("[Email] Failed to send confirmation for order %s: %s", order.id, str(e))


def _get_order_items_for_sr(order: Order, items_data: list):
    """Returns a simple object list compatible with build_shiprocket_order."""
    class _Item:
        def __init__(self, d, fallback_price):
            self.product_name = d.get("name", d["sku"])
            self.product_sku = d["sku"]
            self.quantity = d["quantity"]
            self.unit_price = Decimal(str(d.get("price", fallback_price)))

    fallback = order.total_amount / max(len(items_data), 1)
    return [_Item(d, fallback) for d in items_data]


def _parse_items_metadata(items_str: str, legacy_skus_str: str) -> list:
    """
    Parses items from metadata.
    New format: "sku|name|qty|price,sku|name|qty|price"
    Legacy format (skus only): "sku1:qty1,sku2:qty2"
    """
    items = []
    if items_str:
        for part in items_str.split(","):
            segments = part.strip().split("|")
            if len(segments) >= 3:
                items.append({
                    "sku": segments[0],
                    "name": segments[1] if len(segments) > 1 else segments[0],
                    "quantity": int(segments[2]) if len(segments) > 2 else 1,
                    "price": float(segments[3]) if len(segments) > 3 else 0,
                })
    elif legacy_skus_str:
        for pair in legacy_skus_str.split(","):
            if ":" in pair:
                sku, qty = pair.split(":", 1)
                items.append({"sku": sku.strip(), "quantity": int(qty.strip())})
    return items


def _parse_shipping_address(stripe_session: dict, metadata: dict) -> dict:
    """Extract shipping address from Stripe session or metadata."""
    stripe_shipping = stripe_session.get("shipping_details", {})
    if stripe_shipping:
        addr = stripe_shipping.get("address", {})
        return {
            "name": stripe_shipping.get("name", ""),
            "address": addr.get("line1", ""),
            "address2": addr.get("line2", ""),
            "city": addr.get("city", ""),
            "state": addr.get("state", ""),
            "pincode": addr.get("postal_code", ""),
            "country": addr.get("country", "IN"),
            "phone": metadata.get("phone", ""),
        }

    # Fall back to metadata (from our checkout form)
    return {
        "name": metadata.get("shipping_name", ""),
        "address": metadata.get("shipping_address", ""),
        "city": metadata.get("shipping_city", ""),
        "state": metadata.get("shipping_state", ""),
        "pincode": metadata.get("shipping_pincode", ""),
        "country": "India",
        "phone": metadata.get("phone", ""),
        "email": metadata.get("email", ""),
    }
