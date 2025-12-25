import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/meetcard.css";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MeetCards() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Always use SmartMeet JWT (not Google access token)
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchCalendarEvents = async () => {
    setLoading(true);
    setStatus("");
    const token = getAuthToken();

    if (!token) {
      console.error("❌ No SmartMeet token found");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("http://localhost:8000/api/calendar-events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success === false) {
        // Show backend-provided error message
        setStatus(res.data.message || "Failed to fetch calendar events.");
        setEvents([]);
      } else {
        const fetchedEvents = res.data.events || [];
        setEvents(fetchedEvents);

        if (fetchedEvents.length === 0) {
          setStatus(
            res.data.message ||
              "No upcoming meetings found. Please connect your Google Calendar."
          );
        }
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setStatus(
        err.response?.data?.message || "Failed to fetch calendar events."
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendSummaries = async () => {
    setStatus("Processing summaries...");
    const token = getAuthToken();

    if (!token) {
      console.error("❌ No SmartMeet token found for summaries");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/calendar-summary-email",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success === false) {
        setStatus(res.data.message || "Failed to send summaries.");
      } else {
        setStatus(res.data.message || "Summaries sent successfully!");
      }
    } catch (err) {
      console.error("Error sending summaries:", err);
      setStatus(
        err.response?.data?.message || "Failed to send summaries."
      );
    }
  };

  const handleCardClick = (meetId) => {
    if (meetId) navigate(`/meet-details/${meetId}`);
  };

  return (
    <div className="meeting-page">
      <h2 className="meeting-header">Your Meetings</h2>

      <button onClick={handleSendSummaries} style={{ marginBottom: "1rem" }}>
        Send Summary Emails
      </button>

      {status && <p>{status}</p>}

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Loading meetings...
        </p>
      ) : events.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>{status}</p>
      ) : (
        <div className="meeting-list">
          {events.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-card"
              onClick={() => handleCardClick(meeting.id)}
              style={{ cursor: meeting.id ? "pointer" : "default" }}
            >
              <h3>{meeting.summary || "Untitled Event"}</h3>
              <p className="meet-id">Event ID: {meeting.id}</p>
              <div className="meeting-time">
                <CalendarIcon className="calendar-icon" />
                <span>{meeting.start}</span>
              </div>
              {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="attendees">
                  {meeting.attendees.map((email, idx) => (
                    <span key={idx} className="badge">
                      {email}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
