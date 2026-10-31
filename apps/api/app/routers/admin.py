"""Admin endpoints (token-guarded).

Read-only listing/detail views for orders and newsletter signups (SELECT only —
no writes, no table ownership), plus the existing non-success order purge.
"""

import csv
import io
import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Request, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, func

from app.database import get_session
from app.config import settings
from app.models.order import Order, OrderItem, Payment
from app.models.newsletter import NewsletterSignup
from app.schemas.admin import (
    OrderListItem,
    OrderListResponse,
    OrderDetail,
    OrderPaymentOut,
    NewsletterItem,
    NewsletterListResponse,
)
from app.schemas.order import OrderItemOut
from app.services.retention_service import purge_stale_orders

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


def _verify_admin_token(request: Request) -> None:
    """Shared-secret guard. Reuses the webhook token as the admin secret so no
    extra credential is required; reject if unset or mismatched.
    """
    provided = request.query_params.get("token") or request.headers.get("x-admin-token", "")
    if not settings.shiprocket_webhook_token or provided != settings.shiprocket_webhook_token:
        raise HTTPException(status_code=401, detail="Unauthorized.")


@router.post("/orders/purge-stale")
def purge_stale(request: Request, db: Session = Depends(get_session)):
    """Delete non-success orders older than the configured retention window.

    Never touches success/fulfilment orders. Trigger manually (no cron).
    """
    _verify_admin_token(request)
    result = purge_stale_orders(db)
    return result


# --- Read-only admin listing/detail (admin-data-visibility) ---------------


@router.get("/orders", response_model=OrderListResponse)
def list_orders(
    request: Request,
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: str | None = Query(None),
    q: str | None = Query(None),
):
    """Paginated, newest-first order list. Read-only. (Req 1.1, 1.2, 1.5, 1.6)"""
    _verify_admin_token(request)

    conditions = []
    if status:
        conditions.append(Order.status == status)
    if q:
        like = f"%{q.strip()}%"
        conditions.append(
            (Order.customer_email.ilike(like)) | (Order.phonepe_order_id.ilike(like))
        )

    count_stmt = select(func.count()).select_from(Order)
    for c in conditions:
        count_stmt = count_stmt.where(c)
    total = db.exec(count_stmt).one()

    stmt = select(Order)
    for c in conditions:
        stmt = stmt.where(c)
    stmt = stmt.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    orders = db.exec(stmt).all()

    return OrderListResponse(
        total=total,
        page=page,
        page_size=page_size,
        orders=[_to_list_item(o) for o in orders],
    )


@router.get("/orders/{order_id}", response_model=OrderDetail)
def get_order_detail(order_id: uuid.UUID, request: Request, db: Session = Depends(get_session)):
    """Full read-only detail for a single order. 404 if absent. (Req 1.3, 1.4)"""
    _verify_admin_token(request)

    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    items = db.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    payments = db.exec(select(Payment).where(Payment.order_id == order.id)).all()

    return OrderDetail(
        id=order.id,
        phonepe_order_id=order.phonepe_order_id,
        status=order.status,
        payment_method=order.payment_method,
        total_amount=order.total_amount,
        currency=order.currency,
        customer_email=order.customer_email,
        awb_code=order.awb_code,
        shipment_status=order.shipment_status,
        created_at=order.created_at,
        shipping_address=order.shipping_address,
        shiprocket_order_id=order.shiprocket_order_id,
        shiprocket_shipment_id=order.shiprocket_shipment_id,
        courier_name=order.courier_name,
        shipment_status_at=order.shipment_status_at,
        updated_at=order.updated_at,
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
        payments=[
            OrderPaymentOut(
                amount=p.amount,
                status=p.status,
                phonepe_payment_id=p.phonepe_payment_id,
                created_at=p.created_at,
            )
            for p in payments
        ],
    )


@router.get("/newsletter", response_model=NewsletterListResponse)
def list_newsletter(
    request: Request,
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
):
    """Paginated, newest-first newsletter signups. Read-only. (Req 2.1, 2.2, 2.4)"""
    _verify_admin_token(request)

    total = db.exec(select(func.count()).select_from(NewsletterSignup)).one()
    stmt = (
        select(NewsletterSignup)
        .order_by(NewsletterSignup.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    signups = db.exec(stmt).all()

    return NewsletterListResponse(
        total=total,
        page=page,
        page_size=page_size,
        signups=[NewsletterItem(email=s.email, created_at=s.created_at) for s in signups],
    )


@router.get("/newsletter/export")
def export_newsletter(request: Request, db: Session = Depends(get_session)):
    """CSV export of all signups (email,created_at). Header-only when empty. (Req 2.6)"""
    _verify_admin_token(request)

    signups = db.exec(
        select(NewsletterSignup).order_by(NewsletterSignup.created_at.desc())
    ).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["email", "created_at"])
    for s in signups:
        writer.writerow([s.email, s.created_at.isoformat()])
    buffer.seek(0)

    filename = f"newsletter-signups-{datetime.utcnow().date().isoformat()}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _to_list_item(order: Order) -> OrderListItem:
    return OrderListItem(
        id=order.id,
        phonepe_order_id=order.phonepe_order_id,
        status=order.status,
        payment_method=order.payment_method,
        total_amount=order.total_amount,
        currency=order.currency,
        customer_email=order.customer_email,
        awb_code=order.awb_code,
        shipment_status=order.shipment_status,
        created_at=order.created_at,
    )
