import urllib.request
import urllib.parse
import os

CLIENT_ID = "SU2610271756106827191751"
CLIENT_VERSION = "1"
CLIENT_SECRET = os.environ.get("PHONEPE_SECRET", "f6b55f44-4f9c-4f1d-9cac-a35b5649bc4a")

# All known PhonePe token endpoint variants from official SDK + docs
ENDPOINTS = [
    ("PROD  v1 (current)",     "https://api.phonepe.com/apis/pg/v1/oauth/token"),
    ("PROD  v2",               "https://api.phonepe.com/apis/pg/v2/oauth/token"),
    ("PROD  no-version",       "https://api.phonepe.com/apis/pg/oauth/token"),
    ("PROD  hermes",           "https://api.phonepe.com/apis/hermes/v3/token"),
    ("SANDBOX v1 (current)",   "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"),
    ("SANDBOX no-version",     "https://api-preprod.phonepe.com/apis/pg-sandbox/oauth/token"),
]

payload_urlenc = urllib.parse.urlencode({
    "client_id":      CLIENT_ID,
    "client_version": CLIENT_VERSION,
    "client_secret":  CLIENT_SECRET,
    "grant_type":     "client_credentials",
}).encode("utf-8")

print("=" * 60)
print("PhonePe Token Endpoint Audit")
print("Client ID: " + CLIENT_ID[:8] + "...[REDACTED]")
print("Format: application/x-www-form-urlencoded")
print("=" * 60)

for label, url in ENDPOINTS:
    print("\n[" + label + "]")
    print("URL: " + url)
    try:
        req = urllib.request.Request(
            url,
            data=payload_urlenc,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            print("STATUS: " + str(resp.status) + " OK")
            if "access_token" in body:
                print("RESULT: SUCCESS - token received")
            else:
                print("RESULT: " + body)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        exc_code = e.headers.get("x-api-exception-code", "none")
        print("STATUS: " + str(e.code))
        print("BODY:   " + body)
        print("X-API-EXCEPTION-CODE: " + exc_code)
    except Exception as e:
        print("NETWORK ERROR: " + str(e))

print("\n" + "=" * 60)
print("Done.")
