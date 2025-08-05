// server.js
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

// Load env
dotenv.config();

// Express app
const app = express();
app.use(express.json());

// CORS
const allowedOrigins = ["http://localhost:3000", "https://chatiepost.netlify.app"];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files
app.use("/uploads", express.static(uploadsDir));

// Routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/posts");

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// HTTP + Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Socket events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-room", (roomId) => socket.join(roomId));
  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
