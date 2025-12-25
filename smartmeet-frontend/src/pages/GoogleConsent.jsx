import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleConsent = () => {
  const navigate = useNavigate();

  const GOOGLE_CLIENT_ID = "627122920758-m9ncbc79bbgdfic5nm60qehkmbmtkj00.apps.googleusercontent.com";
  const REDIRECT_URI = "http://localhost:3000/google-consent";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Send authorization code to backend
      fetch("http://localhost:8000/api/google-consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          const data = await res.json();
          console.log("Backend response:", data);
          if (!res.ok) throw new Error(data.detail || "Google consent failed");
          navigate("/meeting-cards");
        })
        .catch((err) => {
          console.error("Error linking Google account:", err);
          navigate("/meeting-cards");
        });
    } else {
      // Redirect to Google OAuth consent screen
      const scope = "https://www.googleapis.com/auth/calendar.events.readonly";
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(
        scope
      )}&access_type=offline&prompt=consent`;

      console.log("Redirecting to Google OAuth:", oauthUrl);
      window.location.href = oauthUrl;
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <p>Redirecting to Google Calendar consent...</p>
    </div>
  );
};

export default GoogleConsent;
