const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getAllAlerts, acknowledgeAlert } = require("../controllers/alertController");

const router = express.Router();

// GET /api/alerts
router.get("/", getAllAlerts);

// POST /api/alerts/:id/acknowledge
router.post("/:id/acknowledge", authenticateToken, acknowledgeAlert);

module.exports = router;
