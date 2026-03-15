/**
 * Alert Controller
 * Handles alert retrieval, creation, and acknowledgement logic.
 */

const AlertService = require("../services/alertService");
const SensorService = require("../services/sensorService");

async function getAllAlerts(req, res) {
  try {
    const { severity, acknowledged, fresh } = req.query;
    
    // Always generate fresh alerts from current sensor readings
    const sensors = await SensorService.getLatestReadings();
    const freshAlerts = await AlertService.generateAlerts(sensors);
    
    // Merge with persisted alerts
    let persistedAlerts = [];
    if (fresh !== 'true') {
      persistedAlerts = await AlertService.findAll({ severity, acknowledged });
    }
    
    // Combine: fresh first, then persisted (dedupe by location/type)
    const seen = new Set();
    const combined = [
      ...freshAlerts.filter(a => {
        const key = `${a.location}-${a.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
      ...persistedAlerts.filter(a => {
        const key = `${a.location}-${a.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
    ].filter(Boolean);
    
    // Apply filters to combined
    let filtered = combined;
    if (severity) filtered = filtered.filter(a => a.severity === severity);
    if (acknowledged !== undefined) {
      const ack = acknowledged === 'true';
      filtered = filtered.filter(a => (a.acknowledged ?? false) === ack);
    }
    
    res.json({ count: filtered.length, alerts: filtered });
  } catch (err) {
    console.error('[AlertController] Error:', err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}

async function acknowledgeAlert(req, res) {
  try {
    const alert = await AlertService.acknowledge(parseInt(req.params.id), req.user.id);
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    res.json({ message: "Alert acknowledged", alert });
  } catch (err) {
    res.status(500).json({ error: "Failed to acknowledge alert" });
  }
}

module.exports = { getAllAlerts, acknowledgeAlert };
