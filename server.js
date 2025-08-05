const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());

// Allow localhost and deployed frontend
const allowedOrigins = ["http://localhost:3000", "https://chatiepost.netlify.app"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Serve images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/posts");

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("✅ Chat server is running");
});

// Socket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-room", (roomId) => socket.join(roomId));
  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", message);
  });

  socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
});

app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
