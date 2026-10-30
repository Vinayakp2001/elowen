from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime, timedelta
from app.database import get_session
from app.dependencies import get_current_user, get_optional_user
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderOut, OrderItemOut
from app.constants import NON_SUCCESS_STATES, SUCCESS_STATES
import httpx
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])

# PhonePe orders expire after 1200s (see phonepe_service.initiate_payment).
# Give a small grace margin before treating a stale pending order as abandoned.
_PENDING_EXPIRY = timedelta(seconds=1200 + 300)


def _maybe_expire_pending(order: Order, db: Session) -> None:
    """Lazily mark a stale `pending` order as `abandoned` on read."""
    if order.status == "pending" and order.created_at < datetime.utcnow() - _PENDING_EXPIRY:
        order.status = "abandoned"
        db.add(order)
        db.commit()
        db.refresh(order)


def _verify_and_promote_pending(order: Order, db: Session) -> Order:
    """On the redirect-return lookup, confirm payment with PhonePe and promote.

    PhonePe is NOT configured with an S2S callback, so the redirect-return is the
    primary confirmation path. If the order is still `pending`, ask PhonePe for
    the real payment state: COMPLETED -> promote to paid (fires Shiprocket +
    email via the existing path); a terminal non-COMPLETED state -> payment_failed.
    Pending-but-not-yet-final (still processing) is left untouched. Network/SDK
    failures leave the order pending for a later retry — never falsely confirm.

    `abandoned` is included because our lazy pending-expiry can fire while a real
    payment actually completed — PhonePe is the source of truth, so a COMPLETED
    state still promotes even after local expiry.
    """
    if order.status not in ("pending", "abandoned") or not order.phonepe_order_id:
        return order

    from app.services import phonepe_service
    from app.services.order_service import promote_order_to_paid

    try:
        status = phonepe_service.get_order_status(order.phonepe_order_id)
    except Exception as e:
        logger.error("[Verify] PhonePe status lookup failed for %s: %s",
                     order.phonepe_order_id, str(e))
        return order

    state = getattr(status, "state", None) or vars(status).get("state")

    if state == "COMPLETED":
        promote_order_to_paid(order, status, db)
        db.refresh(order)
    elif state in ("FAILED", "CANCELLED", "EXPIRED", "DECLINED"):
        order.status = "payment_failed"
        db.add(order)
        db.commit()
        db.refresh(order)
    else:
        logger.info("[Verify] PhonePe order %s state=%s — leaving pending.",
                    order.phonepe_order_id, state)
    return order


@router.get("/by-phonepe-order/{merchant_order_id}", response_model=OrderOut)
def get_order_by_phonepe_order(merchant_order_id: str, db: Session = Depends(get_session)):
    """Used on the checkout success page — no auth required (merchantOrderId is unguessable).

    Verifies the payment with PhonePe and promotes a confirmed pending order
    (the redirect-return is our primary confirmation path).
    """
    order = db.exec(select(Order).where(Order.phonepe_order_id == merchant_order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    order = _verify_and_promote_pending(order, db)
    _maybe_expire_pending(order, db)
    return _build_order_out(order, db)


@router.get("/mine", response_model=list[OrderOut])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Returns the authenticated user's real orders, newest first.

    Non-success states (pending/abandoned/payment_failed/cancelled) are excluded
    so the history stays clean; single-item lookups still return them.
    """
    orders = db.exec(
        select(Order)
        .where(Order.user_id == current_user.id)
        .where(Order.status.notin_(NON_SUCCESS_STATES))
        .order_by(Order.created_at.desc())
    ).all()
    return [_build_order_out(o, db) for o in orders]


@router.get("/{order_id}/tracking")
async def get_order_tracking(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Returns live Shiprocket tracking data for an order belonging to the authenticated user."""
    from app.services import shiprocket_service

    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden.")

    if not order.awb_code:
        raise HTTPException(status_code=404, detail="Tracking not yet available.")

    try:
        tracking = await shiprocket_service.track_shipment(order.awb_code)
        return tracking
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Tracking service unavailable: {str(e)}")


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_session)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    _maybe_expire_pending(order, db)
    return _build_order_out(order, db)


def _build_order_out(order: Order, db: Session) -> OrderOut:
    items = db.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    return OrderOut(
        id=order.id,
        phonepe_order_id=order.phonepe_order_id,
        payment_method=order.payment_method,
        status=order.status,
        total_amount=order.total_amount,
        currency=order.currency,
        customer_email=order.customer_email,
        shipping_address=order.shipping_address,
        shiprocket_order_id=order.shiprocket_order_id,
        shiprocket_shipment_id=order.shiprocket_shipment_id,
        awb_code=order.awb_code,
        courier_name=order.courier_name,
        shipment_status=order.shipment_status,
        shipment_status_at=order.shipment_status_at,
        items=[
            OrderItemOut(
                sku=i.product_sku,
                variant_key=i.variant_key,
                product_name=i.product_name,
                quantity=i.quantity,
                unit_price=i.unit_price,
            )
            for i in items
        ],
        created_at=order.created_at,
    )
