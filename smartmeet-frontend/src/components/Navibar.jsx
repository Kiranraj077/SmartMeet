// src/components/Navibar.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate
import "../styles/navibar.css";

export default function Navibar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login"); // ✅ Route to login page
  };

  return (
    <nav className="navibar">
      <h1 className="navibar-title">SmartMeet AI</h1>
      <div className="navibar-links">
        <a href="#contact">Contact</a>
        <button className="login-btn" onClick={handleLoginClick}>
          Log In
        </button>
      </div>
    </nav>
  );
}

