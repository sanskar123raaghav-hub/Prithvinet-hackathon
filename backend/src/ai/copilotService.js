/**
 * AI Compliance Copilot Service
 * Returns rule-based environmental insights from query text.
 */

function generateInsight(query) {
  const q = (query || "").toLowerCase();

  if (q.includes("reduce emissions"))
    return "Reducing industrial emissions by 20% in high-density zones can lower ambient PM2.5 by 8–12 µg/m³ within 30 days, significantly improving local air quality indices.";

  if (q.includes("shutdown industries") || q.includes("shut down industries"))
    return "Temporarily shutting down non-compliant industries has historically reduced pollution risk by 35–50% in surrounding areas within 48 hours. Pair with sensor monitoring for verification.";

  if (q.includes("water quality") || q.includes("water pollution"))
    return "Dissolved oxygen levels below 4 mg/L indicate severe water stress. Enforce effluent treatment plant (ETP) compliance and increase sampling frequency near industrial discharge points.";

  if (q.includes("noise"))
    return "Sustained noise above 75 dB in residential zones violates CPCB standards. Recommend acoustic barriers and restricting heavy machinery operation to daytime hours.";

  if (q.includes("compliance") || q.includes("regulation"))
    return "Current CPCB norms require real-time emission monitoring for industries above 50 TPD capacity. Non-compliant units should be flagged for inspection within 15 days.";

  if (q.includes("health") || q.includes("risk"))
    return "Prolonged exposure to AQI above 200 increases respiratory illness incidence by 25%. Issue health advisories and recommend mask usage for vulnerable populations.";

  return "Environmental monitoring data suggests maintaining continuous sensor coverage across all zones. Review the Compliance Dashboard for the latest regulatory status of registered industries.";
}

module.exports = { generateInsight };
