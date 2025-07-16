import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/MeetDetails.css";

const MeetDetails = () => {
  const { meetId: meetingId } = useParams();
  const [transcripts, setTranscripts] = useState([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      console.log("🔎 meetId from URL param:", meetingId);
      console.log("🔐 token in localStorage:", token ? "Present ✅" : "Missing ❌");

      if (!token) {
        console.warn("❌ No token found. Skipping fetch.");
        return;
      }
      if (!meetingId) {
        console.warn("❌ No meetingId found in params.");
        return;
      }

      try {
        // Fetch transcripts
        const transcriptRes = await axios.get(
          `http://localhost:5000/api/transcripts/${meetingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("📄 Transcripts response:", transcriptRes.data);
        setTranscripts(transcriptRes.data || []);

        // Fetch summary
        const summaryRes = await axios.get(
          `http://localhost:5000/api/summary/${meetingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("📑 Summary response:", summaryRes.data);
        setSummary(summaryRes.data.summary || "");
      } catch (error) {
        console.error("❌ Error fetching meeting details:", error);
      }
    };

    fetchData();
  }, [meetingId]);

  return (
    <div className="meet-container">
      <h1 className="meet-title">📋 Meeting Details</h1>

      {/* Transcripts */}
      <section className="meet-section">
        <h2>🗣️ Meeting Transcripts</h2>
        <div className="meet-transcripts">
          {transcripts.length > 0 ? (
            transcripts.map((item, index) => (
              <p key={index} className="meet-transcript-line">
                <strong>{item.speaker}:</strong> {item.transcript}
              </p>
            ))
          ) : (
            <p className="meet-empty">No transcript available.</p>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="meet-section">
        <h2>🧾 Meeting Summary</h2>
        <div className="meet-summary">
          {summary ? (
            <p>{summary}</p>
          ) : (
            <p className="meet-empty">Summary not available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default MeetDetails;




