import uuid
import logging
from app.config import settings
from app.schemas.checkout import CheckoutSessionRequest, PhonePePaymentResponse

from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import StandardCheckoutPayRequest
from phonepe.sdk.pg.payments.v2.models.request.pg_checkout_payment_flow import PgCheckoutPaymentFlow
from phonepe.sdk.pg.payments.v2.models.request.merchant_urls import MerchantUrls
from phonepe.sdk.pg.env import Env

logger = logging.getLogger(__name__)

# Singleton client — initialized once at module load
_env = Env.PRODUCTION if settings.phonepe_env == "PRODUCTION" else Env.SANDBOX
_client = StandardCheckoutClient(
    settings.phonepe_client_id,
    settings.phonepe_client_version,
    settings.phonepe_client_secret,
    _env,
    False,  # should_publish_events
)


def _generate_merchant_order_id() -> str:
    """Alphanumeric only, max 38 chars — PhonePe requirement."""
    return "ELW" + uuid.uuid4().hex[:20].upper()


async def initiate_payment(request: CheckoutSessionRequest) -> PhonePePaymentResponse:
    """Create a PhonePe payment order and return the redirect URL."""
    merchant_order_id = _generate_merchant_order_id()

    # Embed our merchantOrderId in the redirect URL — PhonePe does NOT append it automatically
    redirect_url = f"https://elowen.co.in/checkout/success?order_id={merchant_order_id}"

    # Amount in paise (int)
    amount_paise = int(sum(item.unit_price * item.quantity for item in request.items) * 100)

    payment_flow = PgCheckoutPaymentFlow(
        merchant_urls=MerchantUrls(redirect_url=redirect_url)
    )
    pay_request = StandardCheckoutPayRequest(
        merchant_order_id=merchant_order_id,
        amount=amount_paise,
        payment_flow=payment_flow,
        expire_after=1200,
    )

    response = _client.pay(pay_request)
    response_dict = vars(response)
    logger.info("[PhonePe] Payment initiated: merchant_order_id=%s, phonepe_order_id=%s",
                merchant_order_id, response_dict.get("order_id"))

    return PhonePePaymentResponse(
        order_id=merchant_order_id,
        url=response_dict["redirect_url"],
    )


def get_order_status(merchant_order_id: str):
    """Fetch current order status from PhonePe. Returns SDK status object."""
    return _client.get_order_status(merchant_order_id=merchant_order_id)
