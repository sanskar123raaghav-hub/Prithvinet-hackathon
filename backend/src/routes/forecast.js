const express = require("express");
const { getForecast } = require("../controllers/forecastController");

const router = express.Router();

// GET /api/forecast/:type  (air | water | noise)
router.get("/:type", getForecast);

module.exports = router;
