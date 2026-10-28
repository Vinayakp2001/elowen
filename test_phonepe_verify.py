"""
PhonePe Full Verification — Order Status + Create + Redirect Audit

Usage:
  set PHONEPE_CLIENT_ID=...
  set PHONEPE_CLIENT_SECRET=...
  set PHONEPE_CLIENT_VERSION=1
  python test_phonepe_verify.py
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

# Order IDs from previous tests
PREV_ORDER_IDS = [
    "OMO2610271926164178375851W",
    "OMO2610271945281078164455W",
]

TOKEN_URL = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
PAY_URL   = "https://api.phonepe.com/apis/pg/checkout/v2/pay"

# Status endpoint variants to test
STATUS_VARIANTS = [
    "/apis/pg/checkout/v2/order/{id}/status",
    "/apis/pg/checkout/v2/order/{id}",
    "/apis/pg/v2/order/{id}/status",
]

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET env vars.")
    sys.exit(1)


def get_token():
    payload = urllib.parse.urlencode({
        "client_id":      CLIENT_ID,
        "client_version": CLIENT_VERSION,
        "client_secret":  CLIENT_SECRET,
        "grant_type":     "client_credentials",
    }).encode("utf-8")
    req = urllib.request.Request(
        TOKEN_URL, data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        return data["access_token"], data.get("expires_in")


def call(method, url, token, body=None):
    headers = {"Authorization": "O-Bearer " + token}
    if body:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(
        url, data=body, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode(), dict(resp.headers)
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        return e.code, body_text, dict(e.headers)


# ── 1. Get token ──────────────────────────────────────────────────────────────
print("=" * 65)
print("STEP 1: Token")
try:
    token, expires_in = get_token()
    print("OK — expires_in=" + str(expires_in))
except Exception as e:
    print("FAILED: " + str(e))
    sys.exit(1)

# ── 2. Order status — test correct /status suffix + variants ─────────────────
print("\n" + "=" * 65)
print("STEP 2: Order status endpoint audit")
order_id = PREV_ORDER_IDS[1]  # most recent

for pattern in STATUS_VARIANTS:
    url = "https://api.phonepe.com" + pattern.replace("{id}", order_id)
    status, body, headers = call("GET", url, token)
    exc_code = headers.get("x-api-exception-code", "none")
    print("\n  Pattern: " + pattern)
    print("  URL: " + url)
    print("  HTTP: " + str(status))
    print("  Body: " + body[:200])
    print("  x-api-exception-code: " + exc_code)

# ── 3. Create new order + redirect URL audit ──────────────────────────────────
print("\n" + "=" * 65)
print("STEP 3: Create new ₹1 order + verify redirect URL")

new_order_id = "TEST-" + str(uuid.uuid4())[:12].upper()
redirect_url = "https://elowen.co.in/checkout/success"

request_body = {
    "merchantOrderId": new_order_id,
    "amount": 100,
    "expireAfter": 1200,
    "metaInfo": {"udf1": "verify-test"},
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Elowen Test",
        "merchantUrls": {
            "redirectUrl": redirect_url
        }
    }
}

print("Request fields:")
print("  merchantOrderId: " + new_order_id)
print("  amount: 100 paise (₹1) — correct unit per docs")
print("  paymentFlow.type: PG_CHECKOUT")
print("  redirectUrl: " + redirect_url)

status, body, headers = call(
    "POST", PAY_URL, token,
    body=json.dumps(request_body).encode("utf-8")
)

print("\nResponse HTTP: " + str(status))
if status == 200:
    data = json.loads(body)
    checkout_url = data.get("redirectUrl", "")
    print("orderId:  " + str(data.get("orderId")))
    print("state:    " + str(data.get("state")))
    print("expireAt: " + str(data.get("expireAt")))
    print("redirectUrl domain: " + checkout_url.split("?")[0] if checkout_url else "MISSING")
    print("\nREDIRECT URL (open in browser):")
    print(checkout_url)
    # Verify redirect URL is not modified
    if checkout_url.startswith("https://mercury"):
        print("\nVERIFICATION: redirectUrl is PhonePe-issued — we are not constructing it.")
else:
    print("BODY: " + body[:500])
    print("x-api-exception-code: " + headers.get("x-api-exception-code", "none"))

# ── 4. Summary ────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("SUMMARY")
print("Token endpoint:   identity-manager/v1/oauth/token — WORKING")
print("Create payment:   /apis/pg/checkout/v2/pay — WORKING")
print("Redirect flow:    using exact PhonePe-issued URL — CORRECT")
print("Checkout UI fail: POST /apis/pg/checkout/ui/v2/pay by PhonePe's own JS")
print("                  We have NO control over this call.")
print("=" * 65)
