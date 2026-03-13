/**
 * AI Forecast Service
 * Generates pollution forecasts for the next 24–72 hours.
 * Uses recent sensor data if available, otherwise generates realistic simulated data.
 */

const db = require("../models/db");

/**
 * Generate a 72-hour pollution forecast.
 * Tries to seed the baseline from the most recent PM2.5 sensor reading;
 * falls back to a realistic simulated baseline when no data is available.
 *
 * @returns {{ location: string, parameter: string, forecast: Array }}
 */
async function generateForecast() {
  let baseline = 65; // default realistic PM2.5 baseline (µg/m³)

  try {
    const pool = db.getPool ? db.getPool() : null;
    if (pool) {
      const result = await pool.query(
        `SELECT value FROM sensor_readings
         WHERE parameter = 'PM2.5'
         ORDER BY recorded_at DESC LIMIT 1`
      );
      if (result.rows.length > 0) {
        baseline = parseFloat(result.rows[0].value) || baseline;
      }
    }
  } catch {
    // DB unavailable — continue with simulated baseline
  }

  const forecast = [];
  const now = new Date();

  for (let h = 1; h <= 72; h++) {
    const ts = new Date(now.getTime() + h * 3600000);

    // Simulate a diurnal cycle: pollution peaks around 8 AM and 8 PM
    const hourOfDay = ts.getUTCHours();
    const diurnal =
      Math.sin(((hourOfDay - 2) / 24) * 2 * Math.PI) * 18 +
      Math.sin(((hourOfDay - 14) / 24) * 2 * Math.PI) * 10;

    // Gentle upward trend + random noise
    const trend = h * 0.05;
    const noise = (Math.random() - 0.5) * 12;

    const predicted_value = Math.max(
      5,
      Math.round((baseline + diurnal + trend + noise) * 10) / 10
    );

    // Uncertainty grows with forecast horizon
    const uncertainty = Math.round((3 + h * 0.15 + Math.random() * 2) * 10) / 10;

    forecast.push({
      timestamp: ts.toISOString(),
      predicted_value,
      uncertainty,
    });
  }

  return {
    location: "Raipur Industrial Zone",
    parameter: "PM2.5",
    generatedAt: now.toISOString(),
    forecastHours: 72,
    forecast,
  };
}

module.exports = { generateForecast };
