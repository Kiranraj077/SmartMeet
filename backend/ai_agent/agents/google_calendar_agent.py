from typing import List, Dict
import requests
import os


def fetch_meeting_emails(meeting_id: str) -> Dict[str, str]:
    """
    Fetches a mapping of speaker display names to their email addresses
    from Google Calendar events, using a locally stored JWT token.

    Args:
        meeting_id (str): The identifier of the meeting to match in the calendar.

    Returns:
        Dict[str, str]: Mapping of speaker names (in lowercase) to email addresses.
    """
    token = os.getenv("USER_JWT_TOKEN")  # Ensure this is set securely in your environment

    if not token:
        raise Exception("JWT token not set in environment. Please set USER_JWT_TOKEN.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = "http://localhost:5000/api/calendar/events"  # Update if your Node.js backend URL differs
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to fetch calendar events: {response.status_code} - {response.text}")

    events = response.json()

    for event in events:
        if event.get("meetId") == meeting_id:
            attendees = event.get("attendees", [])
            return {
                attendee.get("displayName", "").lower(): attendee.get("email")
                for attendee in attendees
                if "email" in attendee and "displayName" in attendee
            }

    return {}
