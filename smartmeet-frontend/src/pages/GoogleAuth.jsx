import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GoogleAuth = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      if (!credentialResponse.code) {
        throw new Error("No auth code received from Google");
      }

      const res = await fetch("http://localhost:8000/api/google-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: credentialResponse.code }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save SmartMeet and Google tokens
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("google_access_token", data.google_access_token);
        localStorage.setItem("google_id_token", data.google_id_token);

        navigate("/meeting-cards"); // Redirect after successful login
      } else {
        setError(data.detail || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login error");
    }
  };

  return (
    <GoogleOAuthProvider clientId="627122920758-m9ncbc79bbgdfic5nm60qehkmbmtkj00.apps.googleusercontent.com">
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError("Google Login Failed")}
          useOneTap={false} // Disable OneTap (not supported with auth-code flow)
          flow="auth-code"   // Request authorization code
        />
      </div>
      {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
