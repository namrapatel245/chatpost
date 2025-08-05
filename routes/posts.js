const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Post = require("../models/Post");

const router = express.Router();

// Make sure "uploads" directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { username } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const post = new Post({ username, imageUrl });
    await post.save();

    res.status(201).json({ message: "Post uploaded", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while uploading post" });
  }
});

// 📸 Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

module.exports = router;
