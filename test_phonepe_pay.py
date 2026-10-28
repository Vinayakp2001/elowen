"""
PhonePe ₹1 Test Payment
Step 1: Get token from identity-manager/v1
Step 2: Create payment order (100 paise = ₹1)
Step 3: Print checkout URL to open in browser

Usage:
  set PHONEPE_CLIENT_ID=your_id
  set PHONEPE_CLIENT_SECRET=your_secret
  set PHONEPE_CLIENT_VERSION=1
  python test_phonepe_pay.py
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

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET env vars first.")
    sys.exit(1)

TOKEN_URL = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
PAY_URL   = "https://api.phonepe.com/apis/pg/checkout/v2/pay"

# ── Step 1: Get access token ──────────────────────────────────────────────────
print("Step 1: Getting access token...")
token_payload = urllib.parse.urlencode({
    "client_id":      CLIENT_ID,
    "client_version": CLIENT_VERSION,
    "client_secret":  CLIENT_SECRET,
    "grant_type":     "client_credentials",
}).encode("utf-8")

try:
    req = urllib.request.Request(
        TOKEN_URL,
        data=token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        token_data = json.loads(resp.read().decode())
        access_token = token_data["access_token"]
        print("Token received. expires_in=" + str(token_data.get("expires_in")))
except Exception as e:
    print("FAILED to get token: " + str(e))
    sys.exit(1)

# ── Step 2: Create ₹1 payment ─────────────────────────────────────────────────
print("\nStep 2: Creating ₹1 payment order...")
order_id = "TEST-" + str(uuid.uuid4())[:12].upper()

pay_payload = json.dumps({
    "merchantOrderId": order_id,
    "amount": 100,  # 100 paise = ₹1
    "expireAfter": 1200,
    "metaInfo": {
        "udf1": "test-transaction"
    },
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Elowen Test Payment ₹1",
        "merchantUrls": {
            "redirectUrl": "https://elowen.co.in/checkout/success"
        }
    }
}).encode("utf-8")

try:
    req = urllib.request.Request(
        PAY_URL,
        data=pay_payload,
        headers={
            "Content-Type":  "application/json",
            "Authorization": "O-Bearer " + access_token,
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        pay_data = json.loads(resp.read().decode())
        print("STATUS: " + str(resp.status))
        print("RESPONSE: " + json.dumps(pay_data, indent=2))

        # Extract checkout URL
        checkout_url = None
        if isinstance(pay_data, dict):
            checkout_url = (
                pay_data.get("redirectUrl") or
                pay_data.get("data", {}).get("redirectUrl") or
                pay_data.get("instrumentResponse", {}).get("redirectInfo", {}).get("url")
            )

        if checkout_url:
            print("\n" + "=" * 60)
            print("SUCCESS! Open this URL in your browser to pay ₹1:")
            print(checkout_url)
            print("=" * 60)
        else:
            print("\nNo checkout URL found in response. Full response above.")

except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("HTTP " + str(e.code) + ": " + body)
except Exception as e:
    print("ERROR: " + str(e))
