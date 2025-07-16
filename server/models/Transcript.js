const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true
  },
  speaker: {
    type: String,
    required: true
  },
  transcript: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Transcript", transcriptSchema);
