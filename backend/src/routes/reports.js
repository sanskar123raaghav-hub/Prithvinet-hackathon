const express = require("express");
const { getAllReports, getReportById } = require("../controllers/reportController");

const router = express.Router();

// GET /api/reports
router.get("/", getAllReports);

// GET /api/reports/:id
router.get("/:id", getReportById);

module.exports = router;
