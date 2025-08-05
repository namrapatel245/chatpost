const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");

// Load .env
dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS SETUP — Bulletproof
const allowedOrigins = [
  "http://localhost:3000",
  "https://chatiepost.netlify.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Allow preflight OPTIONS requests (for file upload / complex requests)
app.options("*", cors());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Serve uploaded image files (if storing in local uploads folder)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);

// You can also add userRoutes & messageRoutes here if needed
// const userRoutes = require("./routes/userRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// app.use("/api/users", userRoutes);
// app.use("/api/messages", messageRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Chat server is running");
});

// ✅ Handle 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: "❌ API endpoint not found" });
});

// ✅ Create HTTP server and Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
