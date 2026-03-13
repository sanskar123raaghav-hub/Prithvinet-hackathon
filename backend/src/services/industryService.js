/**
 * Industry Service
 * Data access layer for industry registry operations.
 * Queries PostgreSQL when available; falls back to in-memory mock data.
 */

const db = require("../models/db");

// ── Mock fallback data ────────────────────────────────────────────────
let nextMockId = 4;
const MOCK_INDUSTRIES = [
  {
    id: 1,
    name: "Raipur Steel Plant",
    industryType: "Steel",
    region: "Chhattisgarh",
    latitude: 21.2514,
    longitude: 81.6296,
    emissionLimit: 150,
    status: "Non-Compliant",
    createdAt: new Date("2025-06-01").toISOString(),
    updatedAt: new Date("2026-02-15").toISOString(),
  },
  {
    id: 2,
    name: "Surat Textile Factory",
    industryType: "Textile",
    region: "Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
    emissionLimit: 80,
    status: "Warning",
    createdAt: new Date("2025-08-12").toISOString(),
    updatedAt: new Date("2026-03-01").toISOString(),
  },
  {
    id: 3,
    name: "Vizag Chemical Plant",
    industryType: "Chemical",
    region: "Andhra Pradesh",
    latitude: 17.6868,
    longitude: 83.2185,
    emissionLimit: 100,
    status: "Compliant",
    createdAt: new Date("2025-04-20").toISOString(),
    updatedAt: new Date("2026-01-10").toISOString(),
  },
];

// ── DB helpers ────────────────────────────────────────────────────────
function rowToIndustry(r) {
  return {
    id: r.id,
    name: r.name,
    industryType: r.industry_type,
    region: r.region,
    latitude: r.latitude != null ? parseFloat(r.latitude) : null,
    longitude: r.longitude != null ? parseFloat(r.longitude) : null,
    emissionLimit: r.emission_limit != null ? parseFloat(r.emission_limit) : null,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── Public API ────────────────────────────────────────────────────────
async function findAll(filters = {}) {
  if (!db.isConnected()) {
    let result = [...MOCK_INDUSTRIES];
    if (filters.status) result = result.filter((i) => i.status === filters.status);
    if (filters.region) result = result.filter((i) => i.region === filters.region);
    return result;
  }

  let text = "SELECT * FROM industries WHERE 1=1";
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    text += ` AND status = $${params.length}`;
  }
  if (filters.region) {
    params.push(filters.region);
    text += ` AND region = $${params.length}`;
  }
  text += " ORDER BY created_at DESC";
  const { rows } = await db.query(text, params);
  return rows.map(rowToIndustry);
}

async function findById(id) {
  if (!db.isConnected()) {
    return MOCK_INDUSTRIES.find((i) => i.id === Number(id)) || null;
  }
  const { rows } = await db.query("SELECT * FROM industries WHERE id = $1", [id]);
  return rows.length ? rowToIndustry(rows[0]) : null;
}

async function create(data) {
  if (!db.isConnected()) {
    const industry = {
      id: nextMockId++,
      name: data.name,
      industryType: data.industryType,
      region: data.region,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      emissionLimit: data.emissionLimit ?? null,
      status: data.status || "Compliant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_INDUSTRIES.push(industry);
    return industry;
  }

  const { rows } = await db.query(
    `INSERT INTO industries (name, industry_type, region, latitude, longitude, emission_limit, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.industryType,
      data.region,
      data.latitude ?? null,
      data.longitude ?? null,
      data.emissionLimit ?? null,
      data.status || "Compliant",
    ]
  );
  return rowToIndustry(rows[0]);
}

async function update(id, data) {
  if (!db.isConnected()) {
    const idx = MOCK_INDUSTRIES.findIndex((i) => i.id === Number(id));
    if (idx === -1) return null;
    const updated = {
      ...MOCK_INDUSTRIES[idx],
      ...data,
      id: MOCK_INDUSTRIES[idx].id,
      updatedAt: new Date().toISOString(),
    };
    MOCK_INDUSTRIES[idx] = updated;
    return updated;
  }

  const fields = [];
  const params = [];
  const mapping = {
    name: "name",
    industryType: "industry_type",
    region: "region",
    latitude: "latitude",
    longitude: "longitude",
    emissionLimit: "emission_limit",
    status: "status",
  };

  for (const [jsKey, dbCol] of Object.entries(mapping)) {
    if (data[jsKey] !== undefined) {
      params.push(data[jsKey]);
      fields.push(`${dbCol} = $${params.length}`);
    }
  }

  if (fields.length === 0) return findById(id);

  fields.push("updated_at = NOW()");
  params.push(id);

  const { rows } = await db.query(
    `UPDATE industries SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows.length ? rowToIndustry(rows[0]) : null;
}

async function remove(id) {
  if (!db.isConnected()) {
    const idx = MOCK_INDUSTRIES.findIndex((i) => i.id === Number(id));
    if (idx === -1) return false;
    MOCK_INDUSTRIES.splice(idx, 1);
    return true;
  }

  const { rowCount } = await db.query("DELETE FROM industries WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
