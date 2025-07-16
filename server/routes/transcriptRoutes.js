const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createTranscript,
  getTranscriptsByMeeting
} = require("../controllers/transcriptController");

const router = express.Router();

// Middleware to protect routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded info if needed later
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Create transcript (if you use this somewhere like during live capture)
router.post("/", createTranscript);

// ✅ Get transcripts for a specific meeting (Protected)
router.get("/:meetingId", verifyToken, getTranscriptsByMeeting);

module.exports = router;

