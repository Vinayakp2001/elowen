"""
PhonePe SDK verification test.
Uses the official phonepe-pg-sdk-python to rule out manual request errors.

Usage:
  set PHONEPE_CLIENT_ID=...
  set PHONEPE_CLIENT_SECRET=...
  set PHONEPE_CLIENT_VERSION=1
  python test_phonepe_sdk.py
"""

import os
import sys
import uuid

CLIENT_ID      = os.environ.get("PHONEPE_CLIENT_ID", "")
CLIENT_SECRET  = os.environ.get("PHONEPE_CLIENT_SECRET", "")
CLIENT_VERSION = int(os.environ.get("PHONEPE_CLIENT_VERSION", "1"))

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET env vars.")
    sys.exit(1)

# ── Import SDK ────────────────────────────────────────────────────────────────
try:
    from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
    from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import StandardCheckoutPayRequest
    from phonepe.sdk.pg.payments.v2.models.request.pg_checkout_payment_flow import PgCheckoutPaymentFlow
    from phonepe.sdk.pg.payments.v2.models.request.merchant_urls import MerchantUrls
    from phonepe.sdk.pg.env import Env
    print("SDK imported OK — phonepe-pg-sdk-python v" +
          __import__("importlib.metadata", fromlist=["version"]).version("phonepe-pg-sdk-python"))
except ImportError as e:
    print("SDK import failed: " + str(e))
    sys.exit(1)

# ── Init client — PROD ────────────────────────────────────────────────────────
# Constructor signature (confirmed via inspect):
#   StandardCheckoutClient(client_id, client_version, client_secret, env, should_publish_events, http_client_config)
print("\n--- Initializing StandardCheckoutClient (PRODUCTION) ---")
try:
    client = StandardCheckoutClient(
        client_id=CLIENT_ID,
        client_version=CLIENT_VERSION,
        client_secret=CLIENT_SECRET,
        env=Env.PRODUCTION,
        should_publish_events=False,
    )
    print("Client initialized OK")
except Exception as e:
    print("Init failed: " + str(e))
    sys.exit(1)

# ── Create payment ────────────────────────────────────────────────────────────
merchant_order_id = "SDK-TEST-" + str(uuid.uuid4())[:8].upper()
redirect_url = "https://elowen.co.in/checkout/success"

print("\n--- Creating ₹1 payment via SDK ---")
print("merchantOrderId: " + merchant_order_id)
print("amount: 100 paise (₹1)")
print("redirectUrl: " + redirect_url)

try:
    # Build payment_flow with redirect URL via MerchantUrls
    payment_flow = PgCheckoutPaymentFlow(
        merchant_urls=MerchantUrls(redirect_url=redirect_url)
    )
    request = StandardCheckoutPayRequest(
        merchant_order_id=merchant_order_id,
        amount=100,
        payment_flow=payment_flow,
    )
    response = client.pay(request)
    print("\nResponse type: " + str(type(response)))
    print("Success: " + str(getattr(response, "success", "N/A")))
    print("Code: " + str(getattr(response, "code", "N/A")))

    data = getattr(response, "data", None)
    if data:
        order_id = getattr(data, "order_id", getattr(data, "merchant_order_id", "N/A"))
        state    = getattr(data, "state", "N/A")
        checkout_url = getattr(data, "redirect_url",
                       getattr(data, "checkout_url",
                       getattr(data, "instrumentResponse", {}).get("redirectInfo", {}).get("url", "N/A")
                       if isinstance(getattr(data, "instrumentResponse", None), dict) else "N/A"))
        print("orderId: " + str(order_id))
        print("state:   " + str(state))
        print("redirectUrl: " + str(checkout_url)[:100] + "...")
        print("\nOpen this URL in your browser:")
        print(str(checkout_url))
    else:
        # Try raw dict access
        raw = vars(response) if hasattr(response, "__dict__") else {}
        print("Raw response: " + str(raw)[:500])

except Exception as e:
    print("pay() failed: " + str(e))
    import traceback
    traceback.print_exc()
    sys.exit(1)

# ── Check order status ────────────────────────────────────────────────────────
print("\n--- Checking order status via SDK ---")
try:
    status_response = client.get_order_status(merchant_order_id=merchant_order_id)
    print("Success: " + str(getattr(status_response, "success", "N/A")))
    print("Code: " + str(getattr(status_response, "code", "N/A")))
    status_data = getattr(status_response, "data", None)
    if status_data:
        print("State: " + str(getattr(status_data, "state", "N/A")))
    else:
        print("Raw: " + str(vars(status_response) if hasattr(status_response, "__dict__") else status_response)[:300])
except Exception as e:
    print("get_order_status() failed: " + str(e))
    import traceback
    traceback.print_exc()
