/**
 * Forecast Controller
 * Handles AI-powered pollution forecast requests.
 */

const ForecastService = require("../services/forecastService");

async function getForecast(req, res) {
  try {
    const { type } = req.params;
    const hours = parseInt(req.query.hours) || 72;

    if (!["air", "water", "noise"].includes(type)) {
      return res.status(400).json({ error: "Type must be: air, water, or noise" });
    }

    const forecast = await ForecastService.getForecast(type, hours);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate forecast" });
  }
}

module.exports = { getForecast };
