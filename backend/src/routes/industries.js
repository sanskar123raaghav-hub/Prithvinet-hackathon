const express = require("express");
const {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} = require("../controllers/industryController");

const router = express.Router();

// GET /api/industries
router.get("/", getAllIndustries);

// GET /api/industries/:id
router.get("/:id", getIndustryById);

// POST /api/industries
router.post("/", createIndustry);

// PUT /api/industries/:id
router.put("/:id", updateIndustry);

// DELETE /api/industries/:id
router.delete("/:id", deleteIndustry);

module.exports = router;
