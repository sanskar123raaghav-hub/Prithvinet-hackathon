/**
 * Industry Service
 * Data access layer for industry registry operations.
 * Connected to PostgreSQL database.
 */

const db = require("../models/db");

// -- Mock data fallback (for demo when DB unavailable) --
const MOCK_INDUSTRIES = [
  {
    id: 1,
    name: "Tata Steel Plant",
    industryType: "Steel Plant",
    location: "Jamshedpur, Jharkhand",
    latitude: 22.8046,
    longitude: 86.2029,
    emissionLevel: 85,
    status: "Compliant"
  },
  {
    id: 2,
    name: "JSW Steel Works",
    industryType: "Steel Plant",
    location: "Vijayanagar, Karnataka",
    latitude: 15.2464,
    longitude: 75.7975,
    emissionLevel: 120,
    status: "Warning"
  },
  {
    id: 3,
    name: "Ultratech Cement Factory",
    industryType: "Cement Factory",
    location: "Nagpur, Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
    emissionLevel: 65,
    status: "Compliant"
  },
  {
    id: 4,
    name: "ACC Cement Plant",
    industryType: "Cement Factory",
    location: "Chaibasa, Jharkhand",
    latitude: 22.5406,
    longitude: 85.8024,
    emissionLevel: 145,
    status: "Warning"
  },
  {
    id: 5,
    name: "Reliance Chemicals Plant",
    industryType: "Chemical Plant",
    location: "Dahej, Gujarat",
    latitude: 21.7219,
    longitude: 72.6103,
    emissionLevel: 180,
    status: "Non-Compliant"
  },
  {
    id: 6,
    name: "Pidilite Chemical Unit",
    industryType: "Chemical Plant",
    location: "Vapi, Gujarat",
    latitude: 20.3718,
    longitude: 72.9043,
    emissionLevel: 95,
    status: "Compliant"
  },
  {
    id: 7,
    name: "Arvind Textile Mills",
    industryType: "Textile Mill",
    location: "Ahmedabad, Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    emissionLevel: 110,
    status: "Warning"
  },
  {
    id: 8,
    name: "Raymond Textile Plant",
    industryType: "Textile Mill",
    location: "Thane, Maharashtra",
    latitude: 19.2183,
    longitude: 72.9781,
    emissionLevel: 75,
    status: "Compliant"
  },
  {
    id: 9,
    name: "NTPC Power Station",
    industryType: "Power Plant",
    location: "Dadri, Uttar Pradesh",
    latitude: 28.5576,
    longitude: 77.5579,
    emissionLevel: 165,
    status: "Non-Compliant"
  },
  {
    id: 10,
    name: "Adani Power Plant",
    industryType: "Power Plant",
    location: "Mundra, Gujarat",
    latitude: 22.8391,
    longitude: 69.4538,
    emissionLevel: 130,
    status: "Warning"
  },
  {
    id: 11,
    name: "Grasim Cement Works",
    industryType: "Cement Factory",
    location: "Chambal, Rajasthan",
    latitude: 26.6060,
    longitude: 76.9883,
    emissionLevel: 55,
    status: "Compliant"
  }
];

// -- DB helpers --
function rowToIndustry(r) {
  return {
    id: r.id,
    name: r.name,
    industryType: r.industry_type || null,
    location: r.location,
    latitude: r.latitude != null ? parseFloat(r.latitude) : null,
    longitude: r.longitude != null ? parseFloat(r.longitude) : null,
    emissionLevel: r.emission_level != null ? parseFloat(r.emission_level) : null,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// -- Public API --
async function findAll(filters = {}) {
  try {
    let text = "SELECT * FROM industries WHERE 1=1";
    const params = [];
    if (filters.status) {
      params.push(filters.status);
      text += ` AND status = $${params.length}`;
    }
    if (filters.location) {
      params.push(filters.location);
      text += ` AND location = $${params.length}`;
    }
    text += " ORDER BY created_at DESC";
    const { rows } = await db.query(text, params);
    return rows.map(rowToIndustry);
  } catch (dbError) {
    console.warn("[IndustryService] DB error, using mock data:", dbError.message);
    // Filter mock data if filters applied
    let mockData = MOCK_INDUSTRIES;
    if (filters.status) {
      mockData = mockData.filter(ind => ind.status === filters.status);
    }
    if (filters.location) {
      mockData = mockData.filter(ind => ind.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    return mockData;
  }
}

async function findById(id) {
  const { rows } = await db.query("SELECT * FROM industries WHERE id = $1", [id]);
  return rows.length ? rowToIndustry(rows[0]) : null;
}

async function create(data) {
  const { rows } = await db.query(
    `INSERT INTO industries (name, industry_type, location, latitude, longitude, emission_level, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.industryType || null,
      data.location,
      data.latitude ?? null,
      data.longitude ?? null,
      data.emissionLevel ?? null,
      data.status || "Compliant",
    ]
  );
  return rowToIndustry(rows[0]);
}

async function update(id, data) {
  const fields = [];
  const params = [];
  const mapping = {
    name: "name",
    industryType: "industry_type",
    location: "location",
    latitude: "latitude",
    longitude: "longitude",
    emissionLevel: "emission_level",
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
  const { rowCount } = await db.query("DELETE FROM industries WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };

