import asyncio
import logging
import os
import re
import sqlite3
from decimal import Decimal
from sqlmodel import Session, select
from app.models.order import Order, OrderItem, Payment
from app.constants import SUCCESS_STATES
import uuid
from typing import Optional

logger = logging.getLogger(__name__)

# A clean 10-digit Indian mobile (no +91, spaces, or leading zero).
_INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def _warn_if_bad_phone(phone: str, order_id) -> None:
    """Log a warning when the shipping phone is not a clean 10-digit mobile.

    Shiprocket rejects malformed phones with 422; we still attempt fulfilment
    but surface the issue so it can be diagnosed.
    """
    cleaned = re.sub(r"\D", "", phone or "")
    if not _INDIAN_MOBILE_RE.match(cleaned):
        logger.warning(
            "[Fulfilment] Order %s shipping phone %r is not a clean 10-digit "
            "Indian mobile — Shiprocket may reject it (422).",
            order_id, phone,
        )

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
    asyncio.create_task(_post_order_tasks(order.id, cod=False))

    return order


async def _post_order_tasks(order_id: uuid.UUID, cod: bool = False):
    """Async post-order: decrement inventory, create Shiprocket shipment, send confirmation email.

    Shared by both the PhonePe (prepaid) and COD paths. Items and shipping are
    read fresh from the persisted order (its `OrderItem` rows), never from
    webhook/body metadata. When `cod` is True the Shiprocket shipment is created
    in COD mode and the confirmation email uses COD wording.
    """
    from app.services.shiprocket_service import build_shiprocket_order, create_shipment, assign_awb
    from app.services.email_service import send_order_confirmation
    from app.database import engine
    from sqlmodel import Session as DBSession

    # Load the order and its items fresh from the DB (source of truth).
    with DBSession(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            logger.error("[Fulfilment] Order %s not found for post-order tasks.", order_id)
            return
        order_items = session.exec(
            select(OrderItem).where(OrderItem.order_id == order_id)
        ).all()
        # Detach the data we need before the session closes.
        shipping_address = dict(order.shipping_address or {})
        customer_email = order.customer_email
        total_amount = order.total_amount
        created_at = order.created_at
        order_id_str = str(order.id)
        items_for_email = [
            {"name": i.product_name, "quantity": i.quantity, "price": float(i.unit_price)}
            for i in order_items
        ]
        items_for_sr = [
            _SRItem(i.product_name, i.product_sku, i.quantity, i.unit_price)
            for i in order_items
        ]
        order_for_sr = _OrderSnapshot(order_id_str, created_at, customer_email, total_amount)

    _warn_if_bad_phone(shipping_address.get("phone", ""), order_id)

    # 1. Decrement inventory for purchased SKUs
    skus = [i.product_sku for i in items_for_sr if i.product_sku]
    if skus:
        _decrement_inventory(skus)

    # 2. Create Shiprocket shipment
    shiprocket_order_id: Optional[str] = None
    shipment_id: Optional[str] = None
    awb_code: Optional[str] = None
    courier_name: Optional[str] = None

    try:
        sr_payload = build_shiprocket_order(
            order_for_sr,
            items_for_sr,
            shipping_address,
            payment_method="COD" if cod else "Prepaid",
        )
        sr_response = await create_shipment(sr_payload)
        shiprocket_order_id = str(sr_response.get("order_id", "")) or None
        shipment_id = str(sr_response.get("shipment_id", "")) or None
    except Exception as e:
        logger.error("[Shiprocket] create_shipment failed for order %s: %s", order_id, str(e))

    if shipment_id:
        try:
            awb_response = await assign_awb(shipment_id)
            awb_data = awb_response.get("response", {}).get("data", {})
            awb_code = awb_data.get("awb_code") or None
            courier_name = awb_data.get("courier_name") or None
        except Exception as e:
            logger.error("[Shiprocket] assign_awb failed for order %s shipment %s: %s", order_id, shipment_id, str(e))

    # Persist whatever we obtained (even partial — e.g. shipment_id without AWB).
    # If Shiprocket failed entirely the order stays paid/confirmed with null
    # shipment fields (graceful partial-failure, no regression).
    if shiprocket_order_id or shipment_id or awb_code:
        try:
            with DBSession(engine) as session:
                db_order = session.get(Order, order_id)
                if db_order:
                    if shiprocket_order_id:
                        db_order.shiprocket_order_id = shiprocket_order_id
                    if shipment_id:
                        db_order.shiprocket_shipment_id = shipment_id
                    if awb_code:
                        db_order.awb_code = awb_code
                    if courier_name:
                        db_order.courier_name = courier_name
                    # COD orders stay "confirmed" (unpaid-but-placed) until
                    # delivered; prepaid orders advance to "processing".
                    if not cod:
                        db_order.status = "processing"
                    session.add(db_order)
                    session.commit()
        except Exception as e:
            logger.error("[Shiprocket] DB update failed for order %s: %s", order_id, str(e))

    # 3. Send order confirmation email
    if customer_email:
        try:
            await send_order_confirmation(
                to=customer_email,
                order_id=order_id_str,
                items=items_for_email,
                total=float(total_amount),
                shipping_address=shipping_address,
                cod=cod,
            )
        except Exception as e:
            logger.error("[Email] Failed to send confirmation for order %s: %s", order_id, str(e))


class _SRItem:
    """Simple item object compatible with build_shiprocket_order."""

    def __init__(self, product_name: str, product_sku: str, quantity: int, unit_price):
        self.product_name = product_name
        self.product_sku = product_sku
        self.quantity = quantity
        self.unit_price = unit_price


class _OrderSnapshot:
    """Minimal order view for build_shiprocket_order, detached from the session."""

    def __init__(self, order_id: str, created_at, customer_email, total_amount):
        self.id = order_id
        self.created_at = created_at
        self.customer_email = customer_email
        self.total_amount = total_amount


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


def create_pending_online_order(request, merchant_order_id: str, db: Session) -> Order:
    """Persist a `pending` online order (+ items + shipping) BEFORE the PhonePe
    redirect, so a confirmed payment always maps to a complete order.

    Validates non-empty items and a positive total (the router guards these too).
    No `Payment` row is created yet — that happens on payment confirmation.
    """
    if not request.items:
        raise ValueError("Cart is empty.")

    total = Decimal(str(sum(item.unit_price * item.quantity for item in request.items)))
    if total <= 0:
        raise ValueError("Invalid order total.")

    customer_email = request.email or ""
    shipping_address = {
        "name": request.shipping_name or "",
        "address": request.shipping_address or "",
        "city": request.shipping_city or "",
        "state": request.shipping_state or "",
        "pincode": request.shipping_pincode or "",
        "country": "India",
        "phone": request.phone or "",
        "email": customer_email,
    }

    user_id: Optional[uuid.UUID] = None
    if request.user_id:
        try:
            user_id = uuid.UUID(request.user_id)
        except ValueError:
            pass

    order = Order(
        phonepe_order_id=merchant_order_id,
        payment_method="online",
        status="pending",
        total_amount=total,
        currency="inr",
        customer_email=customer_email,
        shipping_address=shipping_address,
        user_id=user_id,
    )
    db.add(order)
    db.flush()

    for item in request.items:
        db.add(OrderItem(
            order_id=order.id,
            product_sku=item.sku,
            variant_key=item.variant_key,
            product_name=item.product_name,
            quantity=item.quantity,
            unit_price=Decimal(str(item.unit_price)),
        ))

    db.commit()
    db.refresh(order)
    return order


def promote_order_to_paid(order: Order, status_response, db: Session) -> Order:
    """Promote an existing `pending` online order to `paid` after the PhonePe
    webhook confirms payment, store PhonePe's internal id + a succeeded Payment,
    then schedule fulfilment from the order's already-stored items.
    """
    status_dict = vars(status_response)

    phonepe_internal_id: Optional[str] = status_dict.get("order_id")
    payment_details = status_dict.get("payment_details") or []
    phonepe_payment_id: Optional[str] = None
    if payment_details:
        try:
            phonepe_payment_id = vars(payment_details[0]).get("transaction_id")
        except Exception:
            pass

    amount_paise = status_dict.get("amount", 0)
    paid_total = Decimal(str(amount_paise)) / 100 if amount_paise else order.total_amount

    order.status = "paid"
    if phonepe_internal_id:
        order.phonepe_internal_id = phonepe_internal_id
    db.add(order)

    db.add(Payment(
        order_id=order.id,
        phonepe_payment_id=phonepe_payment_id,
        amount=paid_total,
        status="succeeded",
    ))
    db.commit()
    db.refresh(order)

    # Fulfilment reads items/shipping from the DB (not webhook metadata).
    asyncio.create_task(_post_order_tasks(order.id, cod=False))

    return order


def create_cod_order(request, db: Session) -> Order:
    """Create a Cash on Delivery Order (+ items + pending payment) synchronously.

    No PhonePe/Stripe ids. Order is persisted in a confirmed/unpaid state and
    post-order tasks (inventory, Shiprocket COD shipment, COD email) are
    scheduled in the background.
    """
    total = Decimal(str(sum(item.unit_price * item.quantity for item in request.items)))

    customer_email = request.email or ""
    shipping_address = {
        "name": request.shipping_name or "",
        "address": request.shipping_address or "",
        "city": request.shipping_city or "",
        "state": request.shipping_state or "",
        "pincode": request.shipping_pincode or "",
        "country": "India",
        "phone": request.phone or "",
        "email": customer_email,
    }

    user_id: Optional[uuid.UUID] = None
    if request.user_id:
        try:
            user_id = uuid.UUID(request.user_id)
        except ValueError:
            pass

    order = Order(
        payment_method="cod",
        status="confirmed",
        total_amount=total,
        currency="inr",
        customer_email=customer_email,
        shipping_address=shipping_address,
        user_id=user_id,
    )
    db.add(order)
    db.flush()

    items_data = []
    for item in request.items:
        db.add(OrderItem(
            order_id=order.id,
            product_sku=item.sku,
            variant_key=item.variant_key,
            product_name=item.product_name,
            quantity=item.quantity,
            unit_price=Decimal(str(item.unit_price)),
        ))
        items_data.append({
            "sku": item.sku,
            "name": item.product_name,
            "quantity": item.quantity,
            "price": float(item.unit_price),
        })

    # COD = cash not yet collected -> payment stays pending.
    db.add(Payment(order_id=order.id, amount=total, status="pending"))
    db.commit()
    db.refresh(order)

    asyncio.create_task(_post_order_tasks(order.id, cod=True))

    return order
