"""Admin-triggered maintenance endpoints (token-guarded, no scheduler)."""

import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session

from app.database import get_session
from app.config import settings
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
