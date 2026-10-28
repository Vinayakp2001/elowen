import urllib.request
import urllib.parse

CLIENT_ID = "SU2610271756106827191751"
CLIENT_VERSION = "1"
# Secret passed via environment variable - not hardcoded
import os
CLIENT_SECRET = os.environ.get("PHONEPE_SECRET", "f6b55f44-4f9c-4f1d-9cac-a35b5649bc4a")

TESTS = [
    ("PRODUCTION", "https://api.phonepe.com/apis/pg/v1/oauth/token"),
    ("SANDBOX",    "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"),
]

payload = urllib.parse.urlencode({
    "client_id":     CLIENT_ID,
    "client_version": CLIENT_VERSION,
    "client_secret":  CLIENT_SECRET,
    "grant_type":    "client_credentials",
}).encode("utf-8")

for label, url in TESTS:
    print("\n=== " + label + " ===")
    print("URL: " + url)
    print("Method: POST")
    print("Content-Type: application/x-www-form-urlencoded")
    print("Params: client_id=[REDACTED], client_version=" + CLIENT_VERSION + ", client_secret=[REDACTED], grant_type=client_credentials")
    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            print("HTTP STATUS: " + str(resp.status))
            print("RESPONSE BODY: " + body)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print("HTTP STATUS: " + str(e.code))
        print("RESPONSE BODY: " + body)
        print("RESPONSE HEADERS: " + str(dict(e.headers)))
    except Exception as e:
        print("NETWORK ERROR: " + str(e))
