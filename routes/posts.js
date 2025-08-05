// routes/posts.js

const express = require("express");
const multer = require("multer");
const Post = require("../models/Post"); // Your Post model
const router = express.Router();
const path = require("path");

// Storage setup for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1660000000000.jpg
  },
});

const upload = multer({ storage });

// ✅ Upload route
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.body.userId,
      imageUrl: `/uploads/${req.file.filename}`,
      caption: req.body.caption || "",
    });

    await newPost.save();
    res.status(201).json({ message: "Post uploaded", post: newPost });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
