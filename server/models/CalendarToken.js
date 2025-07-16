const mongoose = require("mongoose");

const calendarTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessToken: String,
  refreshToken: String,
  expiryDate: Number,
});

module.exports = mongoose.model("CalendarToken", calendarTokenSchema);
