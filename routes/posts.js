const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");

const router = express.Router();

// ✅ Store image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /api/posts/:id/image
router.get("/:id/image", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.image || !post.image.data) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", post.image.contentType);
    res.send(post.image.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// GET /api/posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});



// ✅ POST /api/posts/upload
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const newPost = new Post({
      userId: req.body.userId,
      caption: req.body.caption || "",
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await newPost.save();

    res.status(201).json({ message: "Post uploaded successfully", post: newPost });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
