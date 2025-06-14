import React from "react";
import "../styles/navibar.css";

export default function Navibar() {
  return (
    <nav className="navibar">
      <h1 className="navibar-title">SmartMeet AI</h1>
      <div className="navibar-links">
        
        <a href="#contact">Contact</a>
        <button className="login-btn">Log In</button>
      </div>
    </nav>
  );
}
