/**
 * Alert Service
 * Data access layer for alert operations.
 * Queries PostgreSQL when available; falls back to in-memory mock data.
 */

const db = require("../models/db");
const SensorService = require("./sensorService");

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

async function createAlertIfThresholdExceeded(sensorId, readingData) {
  const sensor = await SensorService.findById(sensorId);
  if (!sensor) {
    console.warn(`[AlertService] Sensor ${sensorId} not found`);
    return null;
  }

  let alertType, severity, message;
  const location = sensor.location;

  if (sensor.type === 'air' && readingData.pm25 > 150) {
    alertType = 'Air Quality';
    severity = 'critical';
    message = `PM2.5 exceeded 150 µg/m³ at ${location}`;
  } else if (sensor.type === 'noise' && ( (readingData.decibels || 0) > 85 || (readingData.peak_db || 0) > 85 )) {
    alertType = 'Noise';
    severity = 'warning';
    message = `Noise level exceeded 85 dB at ${location}`;
  } else if (sensor.type === 'water' && ( (readingData.ph || 0) < 6.5 || (readingData.ph || 0) > 8.5 )) {
    alertType = 'Water Quality';
    severity = 'warning';
    message = `Water pH outside 6.5–8.5 range at ${location}`;
  } else {
    return null; // No violation
  }

  // Check for recent duplicate (last 10 min)
  if (!db.isConnected()) {
    const recentMinutes = 10;
    const cutoff = Date.now() - recentMinutes * 60 * 1000;
    const recent = MOCK_ALERTS.some(a => 
      a.message.includes(location) && 
      a.type === alertType && 
      Date.parse(a.timestamp) > cutoff
    );
    if (recent) return null;

    // Add new mock alert
    const newAlert = {
      id: MOCK_ALERTS.length + 1,
      type: alertType,
      severity,
      message: `${message} (${new Date().toISOString().slice(0,16)}Z)`,
      location,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    MOCK_ALERTS.unshift(newAlert);
    return newAlert;
  }

  // DB check
  const { rows: recentAlerts } = await db.query(
    `SELECT id FROM alerts 
     WHERE sensor_id = $1 AND type = $2 AND created_at > NOW() - INTERVAL '10 minutes'`,
    [sensorId, alertType]
  );
  if (recentAlerts.length > 0) {
    return null; // Duplicate
  }

  const { rows } = await db.query(
    `INSERT INTO alerts (type, severity, message, sensor_id, location) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [alertType, severity, message, sensorId, location]
  );
  return rows.length ? rowToAlert(rows[0]) : null;
}

// Automatic alert generation from current sensor readings
async function generateAlerts(sensors) {
  const alerts = [];
  const now = new Date().toISOString();

  for (const sensor of sensors) {
    const reading = sensor.lastReading || {};
    const location = sensor.location;
    let alertType, severity, message;

    if (sensor.type === 'air') {
      const aqi = reading.aqi || 0;
      const pm25 = reading.pm25 || 0;
      if (aqi > 150) {
        alertType = 'Air Pollution';
        severity = 'high';
        message = `AQI critical: ${Math.round(aqi)}`;
        alerts.push({ id: `alert-${sensor.id}-aqi`, type: alertType, location, message, severity, timestamp: now });
      }
      if (pm25 > 60) {
        alertType = 'Air Quality Warning';
        severity = 'warning';
        message = `PM2.5 high: ${pm25.toFixed(1)} µg/m³`;
        alerts.push({ id: `alert-${sensor.id}-pm25`, type: alertType, location, message, severity, timestamp: now });
      }
    } else if (sensor.type === 'noise') {
      const noise = reading.decibels || 0;
      if (noise > 75) {
        alertType = 'Noise Pollution';
        severity = 'warning';
        message = `Noise: ${noise.toFixed(0)} dB`;
        alerts.push({ id: `alert-${sensor.id}-noise`, type: alertType, location, message, severity, timestamp: now });
      }
    } else if (sensor.type === 'water') {
      const doLevel = reading.dissolvedOxygen || 0;
      if (doLevel < 4) {
        alertType = 'Water Pollution';
        severity = 'high';
        message = `Dissolved Oxygen low: ${doLevel.toFixed(1)} mg/L`;
        alerts.push({ id: `alert-${sensor.id}-do`, type: alertType, location, message, severity, timestamp: now });
      }
    }
  }

  return alerts;
}

module.exports = { findAll, acknowledge, createAlertIfThresholdExceeded, generateAlerts };


