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
       
        const transcriptRes = await axios.get(
          `http://localhost:5000/api/transcripts/${meetingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("📄 Transcripts response:", transcriptRes.data);
        setTranscripts(transcriptRes.data || []);

        
        const summaryRes = await axios.post(
          `http://localhost:5000/api/transcripts/summarize`,
          { meetingId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("📑 Summary response:", summaryRes.data);
        console.log("🧾 Summary content:", summaryRes.data.summary);
        setSummary(summaryRes.data.summary || "");
      } catch (error) {
        console.error("❌ Error fetching meeting details:", error);
        if (error.response) {
          console.error("🔍 Backend response error:", error.response.data);
        }
      }
    };

    fetchData();
  }, [meetingId]);

  return (
    <div className="meet-container">
      <h1 className="meet-title">📋 Meeting Details</h1>

      
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

      
      <section className="meet-section">
        <h2>🧾 Meeting Summary</h2>
        <div className="meet-summary">
          {summary?.trim() ? (
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







