/**
 * Sensor Controller
 * Handles business logic for sensor CRUD and data retrieval.
 * Routes delegate to these functions for cleaner separation of concerns.
 */

const SensorService = require("../services/sensorService");

async function getAllSensors(req, res) {
  try {
    const { type, status } = req.query;
    const sensors = await SensorService.findAll({ type, status });
    res.json({ count: sensors.length, sensors });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sensors" });
  }
}

async function getSensorById(req, res) {
  try {
    const sensor = await SensorService.findById(req.params.id);
    if (!sensor) return res.status(404).json({ error: "Sensor not found" });
    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sensor" });
  }
}

async function getSensorReadings(req, res) {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    const readings = await SensorService.getReadings(id, parseInt(hours));
    res.json({ sensorId: id, readings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch readings" });
  }
}

module.exports = { getAllSensors, getSensorById, getSensorReadings };
