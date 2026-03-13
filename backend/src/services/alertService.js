/**
 * Alert Service
 * Data access layer for alert operations.
 * Queries PostgreSQL when available; falls back to in-memory mock data.
 */

const db = require("../models/db");

const MOCK_ALERTS = [
  { id: 1, type: "Air Quality", severity: "critical", message: "PM2.5 exceeded 150 µg/m³ in Delhi Central", location: "Delhi Central, Sensor #S1042", timestamp: new Date(Date.now() - 720000).toISOString(), acknowledged: false },
  { id: 2, type: "Water Quality", severity: "critical", message: "DO dropped below 4.0 mg/L at River Station 7", location: "Yamuna River, Station #7", timestamp: new Date(Date.now() - 2040000).toISOString(), acknowledged: false },
  { id: 3, type: "Noise", severity: "warning", message: "Industrial zone noise exceeded 75 dB", location: "Ahmedabad Industrial, Sensor #S2081", timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { id: 4, type: "Air Quality", severity: "warning", message: "Ozone approaching threshold in Kolkata", location: "Kolkata Industrial, Sensor #S3012", timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: true },
  { id: 5, type: "Water Quality", severity: "info", message: "pH normalized at Chennai Harbor", location: "Chennai Harbor, Sensor #S4501", timestamp: new Date(Date.now() - 10800000).toISOString(), acknowledged: true },
];

function rowToAlert(r) {
  return {
    id: r.id,
    type: r.type,
    severity: r.severity,
    message: r.message,
    location: r.location,
    timestamp: r.created_at,
    acknowledged: r.acknowledged,
    acknowledgedBy: r.acknowledged_by || null,
  };
}

async function findAll(filters = {}) {
  if (!db.isConnected()) {
    let result = [...MOCK_ALERTS];
    if (filters.severity) result = result.filter((a) => a.severity === filters.severity);
    if (filters.acknowledged !== undefined) {
      const ack = filters.acknowledged === "true";
      result = result.filter((a) => a.acknowledged === ack);
    }
    return result;
  }

  let text = "SELECT * FROM alerts WHERE 1=1";
  const params = [];
  if (filters.severity) {
    params.push(filters.severity);
    text += ` AND severity = $${params.length}`;
  }
  if (filters.acknowledged !== undefined) {
    params.push(filters.acknowledged === "true");
    text += ` AND acknowledged = $${params.length}`;
  }
  text += " ORDER BY created_at DESC";
  const { rows } = await db.query(text, params);
  return rows.map(rowToAlert);
}

async function acknowledge(alertId, userId) {
  if (!db.isConnected()) {
    const alert = MOCK_ALERTS.find((a) => a.id === alertId);
    if (!alert) return null;
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    return alert;
  }

  const { rows } = await db.query(
    `UPDATE alerts SET acknowledged = TRUE, acknowledged_by = $1, acknowledged_at = NOW()
     WHERE id = $2 RETURNING *`,
    [userId, alertId]
  );
  return rows.length ? rowToAlert(rows[0]) : null;
}

module.exports = { findAll, acknowledge };
