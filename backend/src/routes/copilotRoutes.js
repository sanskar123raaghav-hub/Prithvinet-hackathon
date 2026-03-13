const express = require("express");
const { generateInsight } = require("../ai/copilotService");

const router = express.Router();

// POST /api/copilot
router.post("/", (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "A 'query' string is required" });
    }
    const answer = generateInsight(query);
    res.json({ answer });
  } catch (err) {
    console.error("[Copilot] Error:", err.message);
    res.status(500).json({ error: "Failed to generate insight" });
  }
});

module.exports = router;
