const express = require("express");
const ComplianceService = require("../services/complianceService");
const IndustryService = require("../services/industryService");

const router = express.Router();

// GET /api/compliance
router.get("/", async (req, res) => {
  try {
    const stats = await ComplianceService.generateComplianceStats();
    res.json(stats);
  } catch (err) {
    console.error('[ComplianceRoutes] Error:', err);
    res.status(500).json({ error: "Failed to fetch compliance stats" });
  }
});

module.exports = router;

