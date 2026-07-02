"""Try to create an EmailJS account and output credentials"""
import json, urllib.request, urllib.error, sys

email = "rozethdaudi@gmail.com"
password = "HBAmedical2026!"
name = "Rozeth Daudi"

data = json.dumps({
    "email": email,
    "password": password,
    "name": name,
    "acceptTerms": True
}).encode()

for url in [
    "https://api.emailjs.com/api/v1.0/auth/signup",
    "https://api.emailjs.com/api/v1.0/account/signup",
    "https://api.emailjs.com/api/v1.0/auth/register",
    "https://api.emailjs.com/api/v1.0/account",
    "https://dashboard.emailjs.com/api/auth/signup",
]:
    try:
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"OK {url}: {resp.status}")
        print(resp.read().decode())
        sys.exit(0)
    except urllib.error.HTTPError as e:
        print(f"FAIL {url}: {e.code}")
    except Exception as e:
        print(f"ERROR {url}: {e}")

print("\nCould not create EmailJS account automatically.")
print(f"Please create account manually at: https://dashboard.emailjs.com/sign-up")
print(f"Using email: {email}")
print(f"Password: {password}")
print("Then get your API keys from: https://dashboard.emailjs.com/admin/account")
