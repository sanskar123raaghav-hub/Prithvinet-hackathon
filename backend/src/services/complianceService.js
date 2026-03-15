/**
 * Compliance Service
 * Generates compliance statistics from industry data
 */

const IndustryService = require("./industryService");

async function generateComplianceStats() {
  const industries = await IndustryService.findAll();
  
  const totalIndustries = industries.length;
  
  const compliant = industries.filter(i => (i.emissionLevel || 0) <= 80).length;
  const warning = industries.filter(i => (i.emissionLevel || 0) > 80 && (i.emissionLevel || 0) <= 150).length;
  const nonCompliant = industries.filter(i => (i.emissionLevel || 0) > 150).length;
  
  const topPolluters = industries
    .filter(i => i.emissionLevel != null)
    .sort((a, b) => (b.emissionLevel || 0) - (a.emissionLevel || 0))
    .slice(0, 5)
    .map(i => ({
      name: i.name,
      location: i.location,
      emissionLevel: i.emissionLevel
    }));
  
  return {
    totalIndustries,
    compliant,
    warning,
    nonCompliant,
    topPolluters
  };
}

module.exports = { generateComplianceStats };

