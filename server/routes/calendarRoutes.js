const express = require("express");
const router = express.Router();
const oauth2Client = require("../config/google");
const { google } = require("googleapis");
const CalendarToken = require("../models/CalendarToken");
const jwt = require("jsonwebtoken");


router.get("/authorize", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).send("Token missing");

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    prompt: "consent",
    state: token, 
  });

  res.redirect(url);
});


router.get("/oauth2callback", async (req, res) => {
  const { code, state } = req.query;
  if (!state) return res.status(401).send("JWT token not provided");

  const decoded = jwt.verify(state, process.env.JWT_SECRET);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const existing = await CalendarToken.findOne({ userId: decoded.userId });

  if (existing) {
    existing.accessToken = tokens.access_token;
    existing.refreshToken = tokens.refresh_token || existing.refreshToken;
    existing.expiryDate = tokens.expiry_date;
    await existing.save();
  } else {
    await CalendarToken.create({
      userId: decoded.userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });
  }

  res.redirect("http://localhost:3000/meeting-cards");
});


router.get("/events", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tokenDoc = await CalendarToken.findOne({ userId: decoded.userId });
    if (!tokenDoc) return res.status(401).json({ message: "No calendar access" });

    oauth2Client.setCredentials({ refresh_token: tokenDoc.refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      conferenceDataVersion: 1,
    });

    const formatted = result.data.items
      .filter(event =>
        event.hangoutLink ||
        event.conferenceData?.entryPoints?.some(entry => entry.entryPointType === "video")
      )
      .map((event, index) => {
        const meetUrl =
          event.hangoutLink ||
          event.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri ||
          null;

       
        let meetId = null;
        if (meetUrl) {
          const match = meetUrl.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
          if (match) meetId = match[1];
        }

        return {
          id: event.id || index,
          title: event.summary || "Untitled Meeting",
          owner: event.organizer?.email || "Unknown",
          time: new Date(event.start?.dateTime || event.start?.date).toString(),
          meetLink: meetUrl,
          meetId: meetId, 
          attendees: (event.attendees || []).map(a => ({
            email: a.email,
            name: a.displayName || null,
          })),
        };
      });

    res.json(formatted);
  } catch (err) {
    console.error("Error in /api/calendar/events:", err.message);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

module.exports = router;









