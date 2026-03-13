/**
 * Report Controller
 * Handles report listing and retrieval.
 */

const ReportService = require("../services/reportService");

async function getAllReports(req, res) {
  try {
    const { category } = req.query;
    const reports = await ReportService.findAll({ category });
    res.json({ count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
}

async function getReportById(req, res) {
  try {
    const report = await ReportService.findById(parseInt(req.params.id));
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
}

module.exports = { getAllReports, getReportById };
