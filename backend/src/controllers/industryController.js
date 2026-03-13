/**
 * Industry Controller
 * Handles validation and business logic for industry registry CRUD.
 */

const IndustryService = require("../services/industryService");

const VALID_STATUSES = ["Compliant", "Warning", "Non-Compliant"];

// ── Helpers ───────────────────────────────────────────────────────────
function validateBody(body, requireAll = true) {
  const errors = [];
  if (requireAll && !body.name) errors.push("name is required");
  if (requireAll && !body.industryType) errors.push("industryType is required");
  if (requireAll && !body.region) errors.push("region is required");

  if (body.latitude !== undefined && (isNaN(body.latitude) || body.latitude < -90 || body.latitude > 90)) {
    errors.push("latitude must be between -90 and 90");
  }
  if (body.longitude !== undefined && (isNaN(body.longitude) || body.longitude < -180 || body.longitude > 180)) {
    errors.push("longitude must be between -180 and 180");
  }
  if (body.emissionLimit !== undefined && (isNaN(body.emissionLimit) || body.emissionLimit < 0)) {
    errors.push("emissionLimit must be a positive number");
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  return errors;
}

// ── Handlers ──────────────────────────────────────────────────────────
async function getAllIndustries(req, res) {
  try {
    const { status, region } = req.query;
    const industries = await IndustryService.findAll({ status, region });
    res.json({ count: industries.length, industries });
  } catch (err) {
    console.error("[IndustryController] findAll error:", err.message);
    res.status(500).json({ error: "Failed to fetch industries" });
  }
}

async function getIndustryById(req, res) {
  try {
    const industry = await IndustryService.findById(req.params.id);
    if (!industry) return res.status(404).json({ error: "Industry not found" });
    res.json(industry);
  } catch (err) {
    console.error("[IndustryController] findById error:", err.message);
    res.status(500).json({ error: "Failed to fetch industry" });
  }
}

async function createIndustry(req, res) {
  try {
    const errors = validateBody(req.body, true);
    if (errors.length) return res.status(400).json({ error: errors.join("; "), details: errors });

    const industry = await IndustryService.create(req.body);
    res.status(201).json({ message: "Industry registered", industry });
  } catch (err) {
    console.error("[IndustryController] create error:", err.message);
    res.status(500).json({ error: "Failed to create industry" });
  }
}

async function updateIndustry(req, res) {
  try {
    const errors = validateBody(req.body, false);
    if (errors.length) return res.status(400).json({ error: errors.join("; "), details: errors });

    const industry = await IndustryService.update(req.params.id, req.body);
    if (!industry) return res.status(404).json({ error: "Industry not found" });
    res.json({ message: "Industry updated", industry });
  } catch (err) {
    console.error("[IndustryController] update error:", err.message);
    res.status(500).json({ error: "Failed to update industry" });
  }
}

async function deleteIndustry(req, res) {
  try {
    const removed = await IndustryService.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: "Industry not found" });
    res.json({ message: "Industry removed" });
  } catch (err) {
    console.error("[IndustryController] delete error:", err.message);
    res.status(500).json({ error: "Failed to delete industry" });
  }
}

module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
};
