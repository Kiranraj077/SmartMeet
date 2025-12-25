from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request())

        # Ensure required fields are extracted
        return {
            "sub": idinfo["sub"],  # Unique Google user ID
            "email": idinfo["email"],
            "name": idinfo.get("name", ""),
            "picture": idinfo.get("picture", "")
        }
    except Exception as e:
        print(f"Google token verification failed: {e}")
        return None
