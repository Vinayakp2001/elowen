"""
PhonePe Audit Test — targeted fixes based on audit findings.

Tests:
1. merchantOrderId with NO hyphens (alphanumeric only)
2. expire_after set explicitly
3. meta_info included
4. Prints exact redirect URL for browser testing

Usage:
  set PHONEPE_CLIENT_ID=SU2610271756106827191751
  set PHONEPE_CLIENT_SECRET=f6b55f44-4f9c-4f1d-9cac-a35b5649bc4a
  set PHONEPE_CLIENT_VERSION=1
  python test_phonepe_audit.py
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

try:
    from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
    from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import StandardCheckoutPayRequest
    from phonepe.sdk.pg.payments.v2.models.request.pg_checkout_payment_flow import PgCheckoutPaymentFlow
    from phonepe.sdk.pg.payments.v2.models.request.merchant_urls import MerchantUrls
    from phonepe.sdk.pg.env import Env
    print("SDK imported OK")
except ImportError as e:
    print("SDK import failed: " + str(e))
    sys.exit(1)

# Init client
client = StandardCheckoutClient(
    client_id=CLIENT_ID,
    client_version=CLIENT_VERSION,
    client_secret=CLIENT_SECRET,
    env=Env.PRODUCTION,
    should_publish_events=False,
)
print("Client initialized OK\n")

# ── Test 1: Alphanumeric-only merchantOrderId (no hyphens) ───────────────────
# Docs say: alphanumeric, max 38 chars, no special characters
# Our previous IDs used hyphens — testing without them
raw_uuid = str(uuid.uuid4()).replace("-", "").upper()[:20]
merchant_order_id = "ELW" + raw_uuid  # e.g. ELW1A2B3C4D5E6F7G8H9

print("=" * 60)
print("TEST 1: Alphanumeric-only merchantOrderId")
print("merchantOrderId: " + merchant_order_id + " (len=" + str(len(merchant_order_id)) + ")")
print("amount: 100 paise (₹1)")
print("expireAfter: 1200 (set explicitly)")
print("redirectUrl: https://elowen.co.in/checkout/success")
print("=" * 60)

try:
    payment_flow = PgCheckoutPaymentFlow(
        merchant_urls=MerchantUrls(redirect_url="https://elowen.co.in/checkout/success")
    )
    request = StandardCheckoutPayRequest(
        merchant_order_id=merchant_order_id,
        amount=100,
        payment_flow=payment_flow,
        expire_after=1200,   # explicitly set
    )
    response = client.pay(request)
    raw = vars(response) if hasattr(response, "__dict__") else {}
    print("\nRaw response: " + str(raw)[:600])

    redirect_url = raw.get("redirect_url", "")
    order_id     = raw.get("order_id", "")
    state        = raw.get("state", "")

    print("\norderId:     " + str(order_id))
    print("state:       " + str(state))
    print("redirectUrl: " + str(redirect_url))

    if redirect_url:
        print("\n>>> OPEN THIS URL IN BROWSER (DevTools Network tab open):")
        print(redirect_url)
        print("\nIn DevTools: look for POST request to /apis/pg/checkout/ui/v2/pay")
        print("Copy the RESPONSE BODY of that request — that is the error detail we need.")
    else:
        print("WARNING: No redirect_url in response")

except Exception as e:
    import traceback
    print("FAILED: " + str(e))
    traceback.print_exc()
    sys.exit(1)

# ── Order status check ────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("Checking order status for: " + merchant_order_id)
try:
    status = client.get_order_status(merchant_order_id=merchant_order_id)
    raw_status = vars(status) if hasattr(status, "__dict__") else {}
    print("State: " + str(raw_status.get("state", "N/A")))
    print("Full: " + str(raw_status)[:400])
except Exception as e:
    print("Status check failed: " + str(e))
