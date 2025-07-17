const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");


dotenv.config();


connectDB();

const app = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());


const authRoutes = require("./routes/authRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");
const calendarRoutes = require("./routes/calendarRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/calendar", calendarRoutes); 


app.get("/", (req, res) => {
  res.send("Server is running");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


