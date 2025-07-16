const Transcript = require("../models/Transcript");

const createTranscript = async (req, res) => {
  const { meetingId, speaker, transcript } = req.body;

  console.log("📥 Transcript POST received:", { meetingId, speaker, transcript });

  if (!meetingId || !speaker || !transcript) {
    return res.status(400).json({ error: "meetingId, speaker, and transcript are required" });
  }

  try {
    const newTranscript = new Transcript({ meetingId, speaker, transcript });
    await newTranscript.save();
    console.log("✅ Transcript saved for meeting:", meetingId);
    res.status(201).json({ message: "Transcript saved successfully" });
  } catch (err) {
    console.error("❌ Error saving transcript:", err.message);
    res.status(500).json({ error: "Server error while saving transcript" });
  }
};


const getTranscriptsByMeeting = async (req, res) => {
  const { meetingId } = req.params;

  console.log("📤 Fetching transcripts for meetingId:", meetingId);

  try {
    const transcripts = await Transcript.find({ meetingId }).sort({ createdAt: 1 });
    console.log(`📦 Found ${transcripts.length} transcripts for ${meetingId}`);
    res.json(transcripts);
  } catch (err) {
    console.error("❌ Error fetching transcripts:", err.message);
    res.status(500).json({ error: "Server error while fetching transcripts" });
  }
};

module.exports = {
  createTranscript,
  getTranscriptsByMeeting,
};
