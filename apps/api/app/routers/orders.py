from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.dependencies import get_current_user, get_optional_user
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderOut, OrderItemOut
import uuid

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/by-session/{session_id}", response_model=OrderOut)
def get_order_by_session(session_id: str, db: Session = Depends(get_session)):
    """Used on the checkout success page — no auth required (session_id is secret enough)."""
    order = db.exec(select(Order).where(Order.stripe_session_id == session_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return _build_order_out(order, db)


@router.get("/mine", response_model=list[OrderOut])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Returns all orders for the authenticated user, newest first."""
    orders = db.exec(
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    ).all()
    return [_build_order_out(o, db) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_session)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return _build_order_out(order, db)


def _build_order_out(order: Order, db: Session) -> OrderOut:
    items = db.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    return OrderOut(
        id=order.id,
        stripe_session_id=order.stripe_session_id,
        status=order.status,
        total_amount=order.total_amount,
        currency=order.currency,
        customer_email=order.customer_email,
        shipping_address=order.shipping_address,
        awb_code=order.awb_code,
        courier_name=order.courier_name,
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
