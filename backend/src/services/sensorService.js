/**
 * Sensor Service
 * Data access layer for sensor operations.
 * Queries PostgreSQL when available; falls back to in-memory mock data.
 */

const db = require("../models/db");

// ── Mock fallback data ────────────────────────────────────────────────
const MOCK_SENSORS = [
  { id: "S1042", type: "air", location: "Delhi Central", lat: 28.6139, lng: 77.209, status: "active", lastReading: { aqi: 156, pm25: 78.4, pm10: 132, timestamp: new Date().toISOString() } },
  { id: "S2015", type: "air", location: "Mumbai Coastal", lat: 19.076, lng: 72.8777, status: "active", lastReading: { aqi: 82, pm25: 35.2, pm10: 68, timestamp: new Date().toISOString() } },
  { id: "S3001", type: "air", location: "Bangalore South", lat: 12.9716, lng: 77.5946, status: "active", lastReading: { aqi: 45, pm25: 18.7, pm10: 42, timestamp: new Date().toISOString() } },
  { id: "S4501", type: "water", location: "Chennai Harbor", lat: 13.0827, lng: 80.2707, status: "active", lastReading: { ph: 7.2, dissolvedOxygen: 5.8, bod: 2.4, timestamp: new Date().toISOString() } },
  { id: "S2081", type: "noise", location: "Ahmedabad Industrial", lat: 23.0225, lng: 72.5714, status: "active", lastReading: { decibels: 78, peakDb: 85, timestamp: new Date().toISOString() } },
  { id: "S6010", type: "noise", location: "Hyderabad Tech Park", lat: 17.385, lng: 78.4867, status: "active", lastReading: { decibels: 55, peakDb: 62, timestamp: new Date().toISOString() } },
];

// ── DB helpers ────────────────────────────────────────────────────────
function rowToSensor(r) {
  return {
    id: r.id,
    type: r.type,
    location: r.location,
    lat: parseFloat(r.latitude),
    lng: parseFloat(r.longitude),
    status: r.status,
  };
}

// ── Public API ────────────────────────────────────────────────────────
async function findAll(filters = {}) {
  if (!db.isConnected()) {
    let result = [...MOCK_SENSORS];
    if (filters.type) result = result.filter((s) => s.type === filters.type);
    if (filters.status) result = result.filter((s) => s.status === filters.status);
    return result;
  }

  let text = "SELECT * FROM sensors WHERE 1=1";
  const params = [];
  if (filters.type) {
    params.push(filters.type);
    text += ` AND type = $${params.length}`;
  }
  if (filters.status) {
    params.push(filters.status);
    text += ` AND status = $${params.length}`;
  }
  text += " ORDER BY id";
  const { rows } = await db.query(text, params);
  return rows.map(rowToSensor);
}

async function findById(id) {
  if (!db.isConnected()) {
    return MOCK_SENSORS.find((s) => s.id === id) || null;
  }
  const { rows } = await db.query("SELECT * FROM sensors WHERE id = $1", [id]);
  return rows.length ? rowToSensor(rows[0]) : null;
}

async function getReadings(sensorId, hours = 24) {
  if (!db.isConnected()) {
    return generateMockReadings(sensorId, hours);
  }
  const { rows } = await db.query(
    `SELECT * FROM sensor_readings
     WHERE sensor_id = $1 AND recorded_at >= NOW() - ($2 || ' hours')::INTERVAL
     ORDER BY recorded_at DESC`,
    [sensorId, hours]
  );
  if (rows.length === 0) return generateMockReadings(sensorId, hours);
  return rows;
}

async function getLatestReadings() {
  if (!db.isConnected()) {
    return MOCK_SENSORS.map((s) => ({ ...s }));
  }
  const { rows } = await db.query(
    `SELECT DISTINCT ON (s.id)
       s.id, s.type, s.location, s.latitude, s.longitude, s.status,
       r.recorded_at, r.aqi, r.pm25, r.pm10, r.ph, r.dissolved_oxygen, r.bod, r.decibels, r.peak_db
     FROM sensors s
     LEFT JOIN sensor_readings r ON r.sensor_id = s.id
     ORDER BY s.id, r.recorded_at DESC NULLS LAST`
  );
  if (rows.length === 0) return MOCK_SENSORS.map((s) => ({ ...s }));
  return rows.map((r) => {
    const sensor = rowToSensor(r);
    sensor.lastReading = {
      timestamp: r.recorded_at,
      aqi: r.aqi, pm25: r.pm25 ? parseFloat(r.pm25) : undefined,
      pm10: r.pm10 ? parseFloat(r.pm10) : undefined,
      ph: r.ph ? parseFloat(r.ph) : undefined,
      dissolvedOxygen: r.dissolved_oxygen ? parseFloat(r.dissolved_oxygen) : undefined,
      bod: r.bod ? parseFloat(r.bod) : undefined,
      decibels: r.decibels ? parseFloat(r.decibels) : undefined,
      peakDb: r.peak_db ? parseFloat(r.peak_db) : undefined,
    };
    return sensor;
  });
}

// ── Mock reading generator ────────────────────────────────────────────
function generateMockReadings(sensorId, hours) {
  const sensor = MOCK_SENSORS.find((s) => s.id === sensorId);
  if (!sensor) return [];
  const readings = [];
  const now = Date.now();
  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now - i * 3600000).toISOString();
    if (sensor.type === "air") {
      readings.push({ timestamp, aqi: Math.floor(Math.random() * 100) + 30, pm25: (Math.random() * 50 + 20).toFixed(1) });
    } else if (sensor.type === "water") {
      readings.push({ timestamp, ph: (Math.random() * 1.0 + 6.5).toFixed(1), dissolvedOxygen: (Math.random() * 2.0 + 4.5).toFixed(1) });
    } else {
      readings.push({ timestamp, decibels: Math.floor(Math.random() * 30) + 45 });
    }
  }
  return readings;
}

module.exports = { findAll, findById, getReadings, getLatestReadings };
