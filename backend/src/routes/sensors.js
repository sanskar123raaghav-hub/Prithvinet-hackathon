const express = require("express");
const { getAllSensors, getSensorById, getSensorReadings, postReading } = require("../controllers/sensorController");
const SensorService = require("../services/sensorService");

const router = express.Router();

// GET /api/sensors
router.get("/", getAllSensors);

// GET /api/sensors/latest — each sensor with its most recent reading
router.get("/latest", async (req, res) => {
  try {
    const sensors = await SensorService.getLatestReadings();
    res.json({ count: sensors.length, sensors });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch latest readings" });
  }
});

// GET /api/sensors/:id
router.get("/:id", getSensorById);

// GET /api/sensors/:id/readings
router.get("/:id/readings", getSensorReadings);

// POST /api/sensors/:id/reading — submit new sensor reading
router.post("/:id/reading", postReading);

module.exports = router;
