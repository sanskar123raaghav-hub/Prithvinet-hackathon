const express = require("express");
const { generateForecast } = require("../ai/forecastService");

const router = express.Router();

// GET /api/ai-forecast
router.get("/", async (_req, res) => {
  try {
    const forecast = await generateForecast();
    res.json(forecast);
  } catch (err) {
    console.error("[AI Forecast] Error:", err.message);
    res.status(500).json({ error: "Failed to generate AI forecast" });
  }
});

module.exports = router;
