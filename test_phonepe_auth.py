"""
PhonePe Standard Checkout V2 - Authentication Endpoint Audit
Credentials loaded from environment variables only. Nothing is hardcoded or printed.

Usage:
  set PHONEPE_CLIENT_ID=your_client_id
  set PHONEPE_CLIENT_SECRET=your_client_secret
  set PHONEPE_CLIENT_VERSION=1
  python test_phonepe_auth.py
"""

import urllib.request
import urllib.parse
import os
import sys

CLIENT_ID = os.environ.get("PHONEPE_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("PHONEPE_CLIENT_SECRET", "")
CLIENT_VERSION = os.environ.get("PHONEPE_CLIENT_VERSION", "1")

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET as environment variables.")
    print("  set PHONEPE_CLIENT_ID=your_id")
    print("  set PHONEPE_CLIENT_SECRET=your_secret")
    sys.exit(1)

# All candidate endpoints including identity-manager variant
ENDPOINTS = [
    # --- PRODUCTION ---
    ("PROD | pg/v1 (official SDK)",          "https://api.phonepe.com/apis/pg/v1/oauth/token"),
    ("PROD | identity-manager/v1 (new?)",    "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"),
    ("PROD | identity-manager/v2 (new?)",    "https://api.phonepe.com/apis/identity-manager/v2/oauth/token"),
    ("PROD | pg/v2",                          "https://api.phonepe.com/apis/pg/v2/oauth/token"),
    # --- SANDBOX ---
    ("SANDBOX | pg-sandbox/v1 (official SDK)","https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"),
    ("SANDBOX | identity-manager/v1",        "https://api-preprod.phonepe.com/apis/identity-manager/v1/oauth/token"),
]

payload = urllib.parse.urlencode({
    "client_id":      CLIENT_ID,
    "client_version": CLIENT_VERSION,
    "client_secret":  CLIENT_SECRET,
    "grant_type":     "client_credentials",
}).encode("utf-8")

print("=" * 65)
print("PhonePe OAuth Token Endpoint Audit")
print("Client ID: " + CLIENT_ID[:6] + "...[REDACTED]")
print("Client Version: " + CLIENT_VERSION)
print("Method: POST | Content-Type: application/x-www-form-urlencoded")
print("Params: client_id, client_version, client_secret, grant_type=client_credentials")
print("=" * 65)

for label, url in ENDPOINTS:
    print("\n[" + label + "]")
    print("URL: " + url)
    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            print("STATUS: " + str(resp.status) + " OK")
            if "access_token" in body:
                print("RESULT: SUCCESS - access_token received (not printed)")
                import json
                d = json.loads(body)
                print("expires_in: " + str(d.get("expires_in", "N/A")))
                print("token_type: " + str(d.get("token_type", "N/A")))
            else:
                print("RESULT: " + body)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        exc_code = e.headers.get("x-api-exception-code", "none")
        print("STATUS: " + str(e.code))
        print("BODY:   " + body)
        print("x-api-exception-code: " + exc_code)
    except Exception as e:
        print("NETWORK ERROR: " + str(e))

print("\n" + "=" * 65)
print("Audit complete.")
