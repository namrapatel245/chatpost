const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure /uploads directory exists
const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// @route POST /api/posts/upload
router.post("/upload", upload.single("image"), (req, res) => {
  const { username } = req.body;
  if (!req.file || !username) {
    return res.status(400).json({ error: "Missing image or username" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({
    message: "Image uploaded successfully!",
    imageUrl,
    uploadedBy: username,
  });
});

module.exports = router;
