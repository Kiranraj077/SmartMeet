import requests
from datetime import datetime, timezone

class CalendarAgent:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

    def fetch_events(self, max_results: int = 10, time_min: str = None):
        """
        Fetch upcoming Google Calendar events.

        Args:
            max_results (int): Maximum number of events to fetch.
            time_min (str): The minimum start time in RFC3339 timestamp format (defaults to now).

        Returns:
            list: List of event items or an empty list on failure.
        """
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }

        if not time_min:
            # Use current UTC time as default
            time_min = datetime.now(timezone.utc).isoformat()

        params = {
            "maxResults": max_results,
            "orderBy": "startTime",
            "singleEvents": True,
            "timeMin": time_min
        }

        response = requests.get(self.base_url, headers=headers, params=params)

        if response.status_code == 200:
            return response.json().get("items", [])
        else:
            print(f"[CalendarAgent] Failed to fetch events: {response.status_code} - {response.text}")
            return []
