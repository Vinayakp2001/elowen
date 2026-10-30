"""Non-success order retention.

Deletes orders (and their child rows) that are in a non-success state and older
than `settings.order_retention_days`. Success/fulfilment orders are NEVER
touched, regardless of age. There is no scheduler — this is triggered via the
token-guarded `POST /admin/orders/purge-stale` endpoint.
"""

import logging
from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.config import settings
from app.constants import NON_SUCCESS_STATES, SUCCESS_STATES
from app.models.order import Order, OrderItem, Payment

logger = logging.getLogger(__name__)


def purge_stale_orders(db: Session) -> dict:
    """Delete non-success orders older than the retention window.

    Returns a summary dict. Safe by construction: the query only selects
    `NON_SUCCESS_STATES`, and an explicit guard refuses to delete any order that
    is in a success state.
    """
    cutoff = datetime.utcnow() - timedelta(days=settings.order_retention_days)

    stale = db.exec(
        select(Order)
        .where(Order.status.in_(NON_SUCCESS_STATES))
        .where(Order.created_at < cutoff)
    ).all()

    deleted = 0
    for order in stale:
        # Defensive guard — must never remove a success/fulfilment order.
        if order.status in SUCCESS_STATES:
            logger.error("[Retention] Refusing to delete success order %s (status=%s).",
                         order.id, order.status)
            continue

        # Remove child rows first (no DB-level cascade defined).
        for item in db.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all():
            db.delete(item)
        for payment in db.exec(select(Payment).where(Payment.order_id == order.id)).all():
            db.delete(payment)
        db.delete(order)
        deleted += 1

    db.commit()
    logger.info("[Retention] Purged %d stale non-success orders older than %s.", deleted, cutoff.isoformat())
    return {"deleted": deleted, "cutoff": cutoff.isoformat(), "retention_days": settings.order_retention_days}
