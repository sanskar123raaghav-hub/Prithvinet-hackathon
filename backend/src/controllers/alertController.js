/**
 * Alert Controller
 * Handles alert retrieval, creation, and acknowledgement logic.
 */

const AlertService = require("../services/alertService");

async function getAllAlerts(req, res) {
  try {
    const { severity, acknowledged } = req.query;
    const alerts = await AlertService.findAll({ severity, acknowledged });
    res.json({ count: alerts.length, alerts });
  } catch (err) {
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
