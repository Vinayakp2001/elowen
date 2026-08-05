import stripe
from app.config import settings
from app.schemas.checkout import CheckoutSessionRequest, CheckoutSessionResponse

stripe.api_key = settings.stripe_secret_key


async def create_checkout_session(
    request: CheckoutSessionRequest,
) -> CheckoutSessionResponse:
    line_items = [
        {
            "price_data": {
                "currency": "inr",
                "product_data": {"name": item.product_name},
                "unit_amount": int(item.unit_price * 100),  # paise
            },
            "quantity": item.quantity,
        }
        for item in request.items
    ]

    # Encode items with name and price for order_service to use
    items_meta = ",".join(
        f"{i.sku}|{i.product_name}|{i.quantity}|{float(i.unit_price)}"
        for i in request.items
    )

    metadata = {
        "user_id": request.user_id or "",
        "coupon_code": request.coupon_code or "",
        "items": items_meta,
        "email": request.email or "",
        "phone": request.phone or "",
        "shipping_name": request.shipping_name or "",
        "shipping_address": request.shipping_address or "",
        "shipping_city": request.shipping_city or "",
        "shipping_state": request.shipping_state or "",
        "shipping_pincode": request.shipping_pincode or "",
    }

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        success_url=request.success_url,
        cancel_url=request.cancel_url,
        customer_email=request.email or None,
        metadata=metadata,
    )

    return CheckoutSessionResponse(session_id=session.id, url=session.url)
