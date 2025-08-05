const express = require("express");
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post");

const router = express.Router();

// Set up storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /api/posts/upload
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { username } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const newPost = new Post({ username, imageUrl });
    await newPost.save();

    res.status(201).json({ message: "Image uploaded", post: newPost });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
