const express = require("express");
const { getForecast } = require("../controllers/forecastController");

const router = express.Router();

// GET /api/forecast (multi-region forecasts)
router.get("/", async (req, res) => {
  try {
    const { getForecast } = require("../services/forecastService");
    const forecast = await getForecast("regions");
    res.json(forecast);
  } catch (err) {
    console.error("[Forecast Route] Error:", err.message);
    res.status(500).json({ error: "Failed to generate forecast" });
  }
});

// GET /api/forecast/:type  (air | water | noise)
router.get("/:type", getForecast);

module.exports = router;
