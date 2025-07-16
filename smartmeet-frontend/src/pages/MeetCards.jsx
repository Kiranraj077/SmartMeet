import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/meetcard.css";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MeetCards() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/calendar/events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          const token = localStorage.getItem("token");
          window.location.href = `http://localhost:5000/api/calendar/authorize?token=${token}`;
        } else {
          console.error("Error fetching events:", err);
        }
      }
    };

    fetchCalendarEvents();
  }, [navigate]);

  const handleCardClick = (meetId) => {
    if (meetId) {
      navigate(`/meet-details/${meetId}`);
    }
  };

  return (
    <div className="meeting-page">
      <h2 className="meeting-header">Your Meetings</h2>

      {events.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          No upcoming meetings found.
        </p>
      ) : (
        <div className="meeting-list">
          {events.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-card"
              onClick={() => handleCardClick(meeting.meetId)}
              style={{ cursor: meeting.meetId ? "pointer" : "default" }}
            >
              <h3>{meeting.title}</h3>
              <p className="owner">Owner: {meeting.owner}</p>
              <p className="meet-id">Meet ID: {meeting.meetId || "N/A"}</p>
              <div className="meeting-time">
                <CalendarIcon className="calendar-icon" />
                <span>{meeting.time}</span>
              </div>
              <div className="attendees">
                {meeting.attendees.map((a, idx) => (
                  <span key={idx} className="badge">
                    {a.name ? `${a.name} (${a.email})` : a.email}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





