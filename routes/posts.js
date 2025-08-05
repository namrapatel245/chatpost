// routes/posts.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Post = require("../models/Post");

const router = express.Router();

// Ensure "uploads" folder exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Upload route
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { username } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const newPost = new Post({ username, imageUrl });
    await newPost.save();

    res.status(201).json({ message: "Post saved", post: newPost });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
