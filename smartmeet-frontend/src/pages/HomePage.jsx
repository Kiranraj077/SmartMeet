import React from "react";
import Navibar from "../components/Navibar";
import FeatureCard from "../components/FeatureCard";
import "../styles/homepage.css";

export default function HomePage() {
  return (
    <div>
      <Navibar />

      <section className="hero">
        <img src="/images/logo.png" alt="smartmeet-logo" className="logoimg"/>
        
        <h2>Smarter Meetings, Faster Decisions.</h2>
        <p>AI-driven summaries and task tracking.</p>
        <button className="get-started-btn">Get Started</button>
        
      </section>

      <section className="features">
        <h3>How SmartMeet AI Works</h3>
        <div className="feature-grid">
          <FeatureCard 
            title="Real-Time Transcription" 
            description="Capture every word using advanced speech-to-text engines." 
          />
          <FeatureCard 
            title="AI-Generated Summaries" 
            description="GPT-powered engine extracts key points and decisions." 
          />
          <FeatureCard 
            title="Smart Task Assignment" 
            description="Tasks are auto-assigned and tracked with reminders." 
          />
        </div>
      </section>

      <footer className="footer">
        © 2025 SmartMeet AI • <a href="#contact">Contact</a> • <a href="#about">About Us</a>
      </footer>
    </div>
  );
}
