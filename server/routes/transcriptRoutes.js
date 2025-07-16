const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createTranscript,
  getTranscriptsByMeeting,
} = require("../controllers/transcriptController");
const { summarizeTranscript } = require("../controllers/summarizerController");

const router = express.Router();


const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


router.post("/", createTranscript);

router.get("/:meetingId", verifyToken, getTranscriptsByMeeting);

router.post("/summarize", verifyToken, summarizeTranscript);

module.exports = router;


