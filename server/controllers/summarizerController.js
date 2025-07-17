const { spawn } = require("child_process");
const Transcript = require("../models/Transcript");
const path = require("path");

const summarizeTranscript = async (req, res) => {
  const { meetingId } = req.body;

  if (!meetingId) {
    return res.status(400).json({ error: "meetingId is required" });
  }

  try {
    
    console.log("Received summarization request for:", meetingId);
    const transcripts = await Transcript.find({ meetingId }).sort({ createdAt: 1 });

    if (transcripts.length === 0) {
      console.warn(" No transcripts found for meeting:", meetingId);
      return res.status(404).json({ error: "No transcripts found for this meeting" });
    }

   
    const fullText = transcripts.map(t => `${t.speaker}: ${t.transcript}`).join(" ");
    console.log("Combined transcript length:", fullText.length);

    
    const pythonPath = "python"; 
    const scriptPath = path.join(__dirname, "../summarizer.py");

    console.log("Spawning Python summarizer...");
    console.log("Python Path:", pythonPath);
    console.log("Script Path:", scriptPath);

    const summarizer = spawn(pythonPath, [scriptPath]);

    let summaryOutput = "";
    let errorOutput = "";

    summarizer.stdout.on("data", (data) => {
      summaryOutput += data.toString();
    });

    summarizer.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    summarizer.on("close", (code) => {
      console.log(" Python process exited with code:", code);
      if (code !== 0) {
        console.error("Python summarizer error:\n", errorOutput);
        return res.status(500).json({ error: "Summarization process failed", stderr: errorOutput });
      }

      console.log("Summary generated successfully!");
      res.json({ summary: summaryOutput.trim() });
    });

   
    summarizer.stdin.write(fullText);
    summarizer.stdin.end();

  } catch (err) {
    console.error("Server error during summarization:", err.message);
    res.status(500).json({ error: "Server error during summarization" });
  }
};

module.exports = {
  summarizeTranscript,
};


