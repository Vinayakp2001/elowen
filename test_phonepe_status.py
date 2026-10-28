"""
PhonePe Order Status Check + Create Payment Audit
Checks the existing order and creates a new one for comparison.

Usage:
  set PHONEPE_CLIENT_ID=...
  set PHONEPE_CLIENT_SECRET=...
  set PHONEPE_CLIENT_VERSION=1
  python test_phonepe_status.py
"""

import urllib.request
import urllib.parse
import json
import uuid
import os
import sys

CLIENT_ID = os.environ.get("PHONEPE_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("PHONEPE_CLIENT_SECRET", "")
CLIENT_VERSION = os.environ.get("PHONEPE_CLIENT_VERSION", "1")

# Order ID from our previous test
EXISTING_ORDER_ID = "OMO2610271926164178375851W"

TOKEN_URL  = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
PAY_URL    = "https://api.phonepe.com/apis/pg/checkout/v2/pay"
STATUS_URL = "https://api.phonepe.com/apis/pg/checkout/v2/order/{order_id}"

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Set env vars PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET")
    sys.exit(1)

# ── Step 1: Get token ─────────────────────────────────────────────────────────
print("=" * 60)
print("Step 1: Getting access token...")
token_payload = urllib.parse.urlencode({
    "client_id":      CLIENT_ID,
    "client_version": CLIENT_VERSION,
    "client_secret":  CLIENT_SECRET,
    "grant_type":     "client_credentials",
}).encode("utf-8")

try:
    req = urllib.request.Request(
        TOKEN_URL, data=token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        token_data = json.loads(resp.read().decode())
        access_token = token_data["access_token"]
        print("Token OK. expires_in=" + str(token_data.get("expires_in")))
except Exception as e:
    print("FAILED: " + str(e))
    sys.exit(1)

# ── Step 2: Check existing order status ──────────────────────────────────────
print("\n" + "=" * 60)
print("Step 2: Checking status of existing order: " + EXISTING_ORDER_ID)
status_url = STATUS_URL.format(order_id=EXISTING_ORDER_ID)
print("URL: " + status_url)
try:
    req = urllib.request.Request(
        status_url,
        headers={"Authorization": "O-Bearer " + access_token},
        method="GET"
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("STATUS: " + str(resp.status))
        print("ORDER STATE: " + str(data.get("state", "N/A")))
        print("AMOUNT: " + str(data.get("amount", "N/A")) + " paise")
        print("EXPIRE_AT: " + str(data.get("expireAt", "N/A")))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("HTTP " + str(e.code) + ": " + body)
except Exception as e:
    print("ERROR: " + str(e))

# ── Step 3: Audit — create a new order and print full request + response ──────
print("\n" + "=" * 60)
print("Step 3: Creating new ₹1 order (full audit)...")

new_order_id = "TEST-" + str(uuid.uuid4())[:12].upper()
redirect_url = "https://elowen.co.in/checkout/success"

request_body = {
    "merchantOrderId": new_order_id,
    "amount": 100,
    "expireAfter": 1200,
    "metaInfo": {"udf1": "audit-test"},
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Elowen Test Payment",
        "merchantUrls": {
            "redirectUrl": redirect_url
        }
    }
}

print("Request body (sanitized):")
print("  merchantOrderId: " + new_order_id)
print("  amount: 100 paise (₹1)")
print("  expireAfter: 1200 seconds")
print("  paymentFlow.type: PG_CHECKOUT")
print("  redirectUrl: " + redirect_url)
print("  Authorization: O-Bearer [REDACTED]")

try:
    req = urllib.request.Request(
        PAY_URL,
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Content-Type":  "application/json",
            "Authorization": "O-Bearer " + access_token,
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("\nRESPONSE STATUS: " + str(resp.status))
        print("orderId:     " + str(data.get("orderId", "N/A")))
        print("state:       " + str(data.get("state", "N/A")))
        print("expireAt:    " + str(data.get("expireAt", "N/A")))
        redirect = data.get("redirectUrl", "")
        if redirect:
            print("redirectUrl: " + redirect[:80] + "...")
            print("\nOpen this URL in browser:")
            print(redirect)
        else:
            print("FULL RESPONSE: " + json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    exc_code = e.headers.get("x-api-exception-code", "none")
    print("HTTP " + str(e.code) + ": " + body)
    print("x-api-exception-code: " + exc_code)
except Exception as e:
    print("ERROR: " + str(e))

print("\n" + "=" * 60)
print("Audit complete.")
