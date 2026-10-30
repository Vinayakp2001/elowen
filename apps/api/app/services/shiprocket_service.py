"""
Shiprocket integration service.

Set SHIPROCKET_ENABLED=true and add SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD
in .env to activate real API calls. Until then, methods log and return
mock responses so the order flow works end-to-end in development.
"""

import logging
from typing import Optional
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_token_cache: Optional[str] = None

# Effective enabled state — may be False even if SHIPROCKET_ENABLED=true
# when credentials are missing (determined on first call or module init)
_effective_enabled: Optional[bool] = None


def _check_effective_enabled() -> bool:
    """Returns True only if enabled AND credentials are present."""
    global _effective_enabled
    if _effective_enabled is not None:
        return _effective_enabled

    if not settings.shiprocket_enabled:
        _effective_enabled = False
        return False

    if not settings.shiprocket_email or not settings.shiprocket_password:
        logger.warning(
            "[Shiprocket] SHIPROCKET_ENABLED=true but SHIPROCKET_EMAIL or "
            "SHIPROCKET_PASSWORD is missing — falling back to stub mode."
        )
        _effective_enabled = False
        return False

    _effective_enabled = True
    return True


async def _get_token(force_refresh: bool = False) -> Optional[str]:
    """Returns a cached auth token, refreshing if force_refresh=True or cache is empty."""
    global _token_cache
    if force_refresh:
        _token_cache = None

    if _token_cache:
        return _token_cache

    if not _check_effective_enabled():
        return None

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.shiprocket_base_url}/auth/login",
            json={"email": settings.shiprocket_email, "password": settings.shiprocket_password},
        )
        resp.raise_for_status()
        _token_cache = resp.json().get("token")
        return _token_cache


async def _api_call(method: str, url: str, **kwargs) -> dict:
    """Makes an authenticated API call; retries once on 401 with a fresh token."""
    token = await _get_token()
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        resp = await getattr(client, method)(url, headers=headers, **kwargs)
        if resp.status_code == 401:
            logger.info("[Shiprocket] 401 received — refreshing token and retrying")
            token = await _get_token(force_refresh=True)
            if not token:
                raise httpx.HTTPStatusError(
                    "Token refresh failed", request=resp.request, response=resp
                )
            headers = {"Authorization": f"Bearer {token}"}
            resp = await getattr(client, method)(url, headers=headers, **kwargs)
        resp.raise_for_status()
        return resp.json()


async def create_shipment(order_data: dict) -> dict:
    """
    Creates a shipment in Shiprocket after a successful payment.

    order_data keys expected:
      order_id, order_date, pickup_location,
      billing_customer_name, billing_address, billing_city,
      billing_pincode, billing_state, billing_country,
      billing_email, billing_phone,
      shipping_* (same fields),
      order_items: [{ name, sku, units, selling_price }],
      payment_method, sub_total, length, breadth, height, weight
    """
    if not _check_effective_enabled():
        logger.info("[Shiprocket STUB] create_shipment called with order_id=%s", order_data.get("order_id"))
        return {
            "order_id": order_data.get("order_id"),
            "shipment_id": "STUB-SHIPMENT-001",
            "status": "NEW",
            "status_code": 1,
            "awb_code": "",
            "courier_name": "",
        }

    return await _api_call(
        "post",
        f"{settings.shiprocket_base_url}/orders/create/adhoc",
        json=order_data,
    )


async def assign_awb(shipment_id: str, courier_id: Optional[int] = None) -> dict:
    """Assigns AWB (Air Waybill) number to a shipment."""
    if not _check_effective_enabled():
        logger.info("[Shiprocket STUB] assign_awb called for shipment_id=%s", shipment_id)
        return {
            "awb_assign_status": 1,
            "response": {
                "data": {
                    "awb_code": f"STUB-AWB-{shipment_id[:8]}",
                    "courier_name": "Blue Dart (STUB)",
                }
            },
        }

    payload: dict = {"shipment_id": shipment_id}
    if courier_id:
        payload["courier_id"] = courier_id

    return await _api_call(
        "post",
        f"{settings.shiprocket_base_url}/courier/assign/awb",
        json=payload,
    )


async def track_shipment(awb_code: str) -> dict:
    """Returns current tracking status for a shipment."""
    if not _check_effective_enabled():
        logger.info("[Shiprocket STUB] track_shipment called for awb=%s", awb_code)
        return {
            "tracking_data": {
                "track_status": 1,
                "shipment_status": "STUB - In Transit",
                "shipment_track": [
                    {
                        "id": 1,
                        "awb_code": awb_code,
                        "courier_company_id": "STUB",
                        "shipment_id": "STUB",
                        "current_status": "In Transit",
                        "delivered_to": "",
                    }
                ],
            }
        }

    return await _api_call(
        "get",
        f"{settings.shiprocket_base_url}/courier/track/awb/{awb_code}",
    )


async def cancel_shipment(awb_codes: list[str]) -> dict:
    """Cancels one or more shipments by AWB code."""
    if not _check_effective_enabled():
        logger.info("[Shiprocket STUB] cancel_shipment called for awbs=%s", awb_codes)
        return {"message": "Shipments cancelled successfully (STUB)", "status": 200}

    return await _api_call(
        "post",
        f"{settings.shiprocket_base_url}/orders/cancel/shipment/awbs",
        json={"awbs": awb_codes},
    )


def build_shiprocket_order(
    order,
    order_items: list,
    shipping_address: dict,
    payment_method: str = "Prepaid",
) -> dict:
    """
    Constructs the Shiprocket order payload from our internal Order model.
    Adjust pickup_location to match your Shiprocket warehouse name.

    `payment_method` is "Prepaid" (online/PhonePe) or "COD". For COD,
    Shiprocket uses `sub_total` as the amount to collect on delivery.
    """
    name = shipping_address.get("name", "")
    phone = shipping_address.get("phone", "")
    address = shipping_address.get("address", "")
    city = shipping_address.get("city", "")
    state = shipping_address.get("state", "")
    pincode = str(shipping_address.get("pincode", ""))

    return {
        "order_id": str(order.id),
        "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
        # Must match a pickup location name configured in the Shiprocket dashboard
        # (Settings -> Pickup Addresses). Configurable via SHIPROCKET_PICKUP_LOCATION;
        # defaults to "work" which is the account's configured location.
        "pickup_location": settings.shiprocket_pickup_location,
        "billing_customer_name": name,
        "billing_last_name": "",
        "billing_address": address,
        "billing_city": city,
        "billing_pincode": pincode,
        "billing_state": state,
        "billing_country": "India",
        "billing_email": order.customer_email or "",
        "billing_phone": phone,
        "shipping_is_billing": True,
        "order_items": [
            {
                "name": item.product_name,
                "sku": item.product_sku,
                "units": item.quantity,
                "selling_price": float(item.unit_price),
            }
            for item in order_items
        ],
        "payment_method": payment_method,
        "sub_total": float(order.total_amount),
        "length": 10,
        "breadth": 10,
        "height": 5,
        "weight": 0.5,
    }
