const express = require("express");
const { generateInsight, generateResponse } = require("../ai/copilotService");
const IndustryService = require("../services/industryService");
const AlertService = require("../services/alertService");
const ForecastService = require("../services/forecastService");
const SensorService = require("../services/sensorService");

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

// POST /api/copilot/query - Enhanced response with data context
router.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "A 'query' string is required" });
    }

    // Fetch contextual data
    const industries = await IndustryService.findAll();
    const alerts = await AlertService.findAll();
    const forecast = await ForecastService.getForecast("air", 72);
    const sensors = await SensorService.getLatestReadings();

    const { answer } = await generateResponse(query, industries, alerts, sensors, forecast);
    res.json({ answer });
  } catch (err) {
    console.error("[Copilot Query] Error:", err.message);
    res.status(500).json({ error: "Failed to generate contextual response" });
  }
});

module.exports = router;
