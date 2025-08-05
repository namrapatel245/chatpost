const express = require("express");
const router = express.Router();

router.post("/upload", uploadMiddleware.single("image"), async (req, res) => {
  // Handle file upload
});

module.exports = router;
