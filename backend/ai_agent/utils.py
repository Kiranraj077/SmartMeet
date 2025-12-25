# ai_agent/utils.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException

load_dotenv()

# --- MongoDB config / helper ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB   = os.getenv("MONGO_DB", "smartmeet")

# reused client to avoid reconnects
_mongo_client = None

def get_mongo_client():
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(MONGO_URI)
    return _mongo_client

def get_database():
    """
    Returns a pymongo Database instance.
    Usage: db = get_database(); coll = db['transcripts']
    """
    client = get_mongo_client()
    return client[MONGO_DB]

# --- Google token verification (keeps what you had) ---
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "627122920758-m9ncbc79bbgdfic5nm60qehkmbmtkj00.apps.googleusercontent.com")

def verify_google_token(token: str):
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        return {
            "user_id": id_info.get("sub"),
            "email": id_info.get("email"),
            "name": id_info.get("name"),
            "picture": id_info.get("picture"),
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
