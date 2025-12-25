from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from .agents.summarizer_agent import SummarizerAgent
from .agents.email_agent import EmailAgent
from ai_agent.utils import get_database
import uvicorn
import os
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()
app = FastAPI()

# -------------------------
# CORS Configuration
# -------------------------
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://meet.google.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Global Agents
# -------------------------
summarizer_agent = SummarizerAgent()
email_agent = EmailAgent()

# -------------------------
# Environment Variables & Constants
# -------------------------
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 12
GOOGLE_CONSENT_REDIRECT_URI = "http://localhost:3000/google-consent"

# -------------------------
# Password Hashing
# -------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# Pydantic Models
# -------------------------
class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    credential: str   # Google ID token from frontend

class TranscriptRequest(BaseModel):
    meetingId: str
    transcript: str
    attendees: list[str] = []

# -------------------------
# JWT Utility
# -------------------------
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=JWT_EXP_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = auth_header.replace("Bearer ", "")
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# -------------------------
# Root Endpoint
# -------------------------
@app.get("/")
async def root():
    return {"message": "SmartMeet AI Backend is up and running!"}

# -------------------------
# Email/Password Authentication
# -------------------------
@app.post("/api/register")
async def register(user: UserRegister):
    db = get_database()
    users = db["users"]

    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    users.insert_one({
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "google_refresh_token": None
    })
    return {"message": "User registered successfully"}

@app.post("/api/login")
async def login(user: UserLogin):
    db = get_database()
    users = db["users"]
    db_user = users.find_one({"email": user.email})

    if not db_user:
        # Auto-register new user
        hashed_password = pwd_context.hash(user.password)
        result = users.insert_one({
            "email": user.email,
            "password": hashed_password,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "google_refresh_token": None
        })
        user_id = str(result.inserted_id)
        google_consent_required = True
    else:
        if not db_user.get("password") or not pwd_context.verify(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user_id = str(db_user["_id"])
        users.update_one({"_id": db_user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})
        google_consent_required = not bool(db_user.get("google_refresh_token"))

    access_token = create_access_token(data={"user_id": user_id, "email": user.email})
    return {
        "token": access_token,
        "email": user.email,
        "userId": user_id,
        "google_consent_required": google_consent_required
    }

# -------------------------
# Google Login (Frontend sends ID token)
# -------------------------
@app.post("/api/google-login")
async def google_login(payload: GoogleLogin):
    try:
        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        email = idinfo["email"]

        db = get_database()
        users = db["users"]
        user = users.find_one({"email": email})

        if not user:
            result = users.insert_one({
                "email": email,
                "google_id": idinfo["sub"],
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "google_refresh_token": None
            })
            user_id = str(result.inserted_id)
        else:
            user_id = str(user["_id"])
            users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

        access_token = create_access_token(data={"user_id": user_id, "email": email})
        return {"token": access_token, "email": email, "userId": user_id}

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Google login failed: {str(e)}")

# -------------------------
# Google OAuth Consent (One-time linking after login)
# -------------------------
@app.post("/api/google-consent")
async def google_consent(request: Request, user_data: dict = Depends(get_current_user)):
    body = await request.json()
    code = body.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code provided")

    db = get_database()
    users_collection = db["users"]
    email = user_data.get("email")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_CONSENT_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_res = requests.post(token_url, data=payload)
    try:
        token_data = token_res.json()
        print("Google token response:", token_data)  # Debug output
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invalid token response: {str(e)}")

    refresh_token = token_data.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=400,
            detail=f"No refresh token received from Google. Full response: {token_data}"
        )

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"google_refresh_token": refresh_token}}
    )

    return {
        "message": "Google account linked successfully",
        "refresh_token_stored": True,
        "token_data": token_data
    }

# -------------------------
# Helper: Get access token from refresh token
# -------------------------
def get_google_access_token(refresh_token: str):
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    res = requests.post(token_url, data=payload)
    return res.json().get("access_token")

# -------------------------
# Calendar Events Endpoint (with proper error messages)
# -------------------------
@app.get("/api/calendar-events")
async def get_calendar_events(user_data: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]

    email = user_data.get("email")
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    refresh_token = user.get("google_refresh_token")
    if not refresh_token:
        return {
            "success": False,
            "message": "Google account not connected. Please re-login with Google to fetch calendar events."
        }

    access_token = get_google_access_token(refresh_token)
    if not access_token:
        return {
            "success": False,
            "message": "Unable to refresh Google access token. Please re-login with Google."
        }

    try:
        calendar_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
        response = requests.get(
            calendar_url,
            headers={"Authorization": f"Bearer {access_token}"},
            params={
                "maxResults": 10,
                "orderBy": "startTime",
                "singleEvents": True,
                "timeMin": datetime.utcnow().isoformat() + "Z"
            }
        )
        response.raise_for_status()
        events = response.json().get("items", [])
        return {"success": True, "events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching calendar events: {str(e)}")

# -------------------------
# Calendar Summarize & Email (Automated)
# -------------------------
def process_user_calendar(user):
    try:
        refresh_token = user.get("google_refresh_token")
        if not refresh_token:
            return

        access_token = get_google_access_token(refresh_token)
        if not access_token:
            return

        db = get_database()
        transcripts_collection = db["transcripts"]
        users_collection = db["users"]

        last_sent = user.get("last_summary_sent") or datetime.utcnow() - timedelta(days=1)

        calendar_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
        response = requests.get(
            calendar_url,
            headers={"Authorization": f"Bearer {access_token}"},
            params={
                "maxResults": 50,
                "orderBy": "startTime",
                "singleEvents": True,
                "timeMin": last_sent.isoformat() + "Z"
            }
        )
        events_data = response.json().get("items", [])

        for event in events_data:
            meeting_id = event.get("id")
            transcript_docs = transcripts_collection.find({"meetingId": meeting_id})
            transcript_text = " ".join([doc.get("transcript", "") for doc in transcript_docs])

            attendees = []
            for doc in transcript_docs:
                attendees.extend(doc.get("attendees", []))
            if not attendees:
                attendees = [att.get("email") for att in event.get("attendees", []) if isinstance(att, dict) and "email" in att]

            if not transcript_text.strip() or not attendees:
                continue

            summary = summarizer_agent.run(transcript_text)
            email_agent.send(summary, attendees)

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_summary_sent": datetime.utcnow()}}
        )

    except Exception as e:
        print(f"Error processing calendar for {user.get('email')}: {str(e)}")

# -------------------------
# APScheduler: Automatic Calendar Processing
# -------------------------
scheduler = BackgroundScheduler()
def automated_summary_job():
    db = get_database()
    users_collection = db["users"]
    for user in users_collection.find({"google_refresh_token": {"$exists": True}}):
        process_user_calendar(user)

scheduler.add_job(automated_summary_job, "interval", minutes=5)
scheduler.start()

# -------------------------
# Transcript Endpoint
# -------------------------
@app.post("/api/transcripts")
async def save_transcript(transcript_req: TranscriptRequest):
    db = get_database()
    transcripts_collection = db["transcripts"]

    transcript_doc = {
        "meetingId": transcript_req.meetingId,
        "transcript": transcript_req.transcript,
        "attendees": transcript_req.attendees,
        "timestamp": datetime.utcnow()
    }

    transcripts_collection.insert_one(transcript_doc)
    return {"message": "Transcript saved successfully"}

# -------------------------
# Run App
# -------------------------
if __name__ == "__main__":
    uvicorn.run("ai_agent.api:app", host="127.0.0.1", port=8000, reload=True)
