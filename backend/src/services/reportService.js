/**
 * Report Service
 * Data access layer for report operations.
 * Queries PostgreSQL when available; falls back to in-memory mock data.
 */

const db = require("../models/db");

const MOCK_REPORTS = [
  { id: 1, title: "Annual Environmental Report 2025", date: "2026-01-15", type: "PDF", size: "4.2 MB", category: "annual" },
  { id: 2, title: "Q4 2025 Air Quality Analysis", date: "2026-01-05", type: "PDF", size: "2.8 MB", category: "quarterly" },
  { id: 3, title: "Water Quality Assessment — Yamuna Basin", date: "2025-12-20", type: "PDF", size: "3.1 MB", category: "special" },
  { id: 4, title: "Noise Pollution Study — Metro Cities", date: "2025-12-10", type: "PDF", size: "1.9 MB", category: "special" },
  { id: 5, title: "Sensor Network Coverage Report", date: "2025-11-30", type: "PDF", size: "1.2 MB", category: "infrastructure" },
];

function rowToReport(r) {
  return {
    id: r.id,
    title: r.title,
    date: r.created_at,
    type: "PDF",
    size: r.file_size || "—",
    category: r.category,
  };
}

async function findAll(filters = {}) {
  if (!db.isConnected()) {
    let result = [...MOCK_REPORTS];
    if (filters.category) result = result.filter((r) => r.category === filters.category);
    return result;
  }

  let text = "SELECT * FROM reports WHERE 1=1";
  const params = [];
  if (filters.category) {
    params.push(filters.category);
    text += ` AND category = $${params.length}`;
  }
  text += " ORDER BY created_at DESC";
  const { rows } = await db.query(text, params);
  return rows.map(rowToReport);
}

async function findById(id) {
  if (!db.isConnected()) {
    return MOCK_REPORTS.find((r) => r.id === id) || null;
  }
  const { rows } = await db.query("SELECT * FROM reports WHERE id = $1", [id]);
  return rows.length ? rowToReport(rows[0]) : null;
}

module.exports = { findAll, findById };
