/**
 * AI Compliance Copilot Service
 * Returns rule-based environmental insights from query text with intent detection.
 */

const IndustryService = require('../services/industryService');
const AlertService = require('../services/alertService');
const SensorService = require('../services/sensorService');
const ForecastService = require('../services/forecastService');

function detectIntent(query) {
  const q = query.toLowerCase();
  
  // Industries intent
  if (q.includes('industry') || q.includes('industries') || q.includes('factory') || q.includes('plant') || q.includes('violation')) {
    return 'industries';
  }
  
  // Alerts intent
  if (q.includes('alert') || q.includes('alerts') || q.includes('warning') || q.includes('violation')) {
    return 'alerts';
  }
  
  // Forecast intent
  if (q.includes('forecast') || q.includes('prediction') || q.includes('tomorrow') || q.includes('future')) {
    return 'forecast';
  }
  
  // Pollution intent
  if (q.includes('pollution') || q.includes('air quality') || q.includes('aqi') || q.includes('pm25')) {
    return 'pollution';
  }
  
  // Risk intent
  if (q.includes('risk') || q.includes('danger') || q.includes('highest pollution')) {
    return 'risk';
  }
  
  // Overview intent
  if (q.includes('overview') || q.includes('status') || q.includes('system')) {
    return 'overview';
  }
  
  return 'unknown';
}

async function generateInsight(query) {
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

async function generateResponse(query, industries = [], alerts = [], sensors = null, forecast = null) {
  const q = (query || "").toLowerCase();
  let answer = '';

  // Fetch real data internally if not provided or empty
  if (!sensors || sensors.length === 0) {
    sensors = await SensorService.getLatestReadings();
  }
  if (!forecast) {
    forecast = await ForecastService.getForecast('air', 72);
  }
  if (!alerts || alerts.length === 0) {
    alerts = await AlertService.findAll({ acknowledged: false });
  }
  if (!industries || industries.length === 0) {
    industries = await IndustryService.findAll();
  }

  const intent = detectIntent(query);
  
  // Compute key insights (used by multiple intents)
  const airSensors = sensors.filter(s => s.type === 'air' && s.lastReading);
  const currentPM25Avg = airSensors.length > 0 ? airSensors.reduce((sum, s) => sum + (s.lastReading.pm25 || 0), 0) / airSensors.length : 0;
  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const violatingIndustries = industries.filter(i => i.status === 'Non-Compliant' || (i.emissionLevel || 0) > 150);
  const violatingCount = violatingIndustries.length;
  const violatingLocations = [...new Set(violatingIndustries.map(i => i.location).filter(Boolean))];

  switch (intent) {
    case 'industries':
      const compliant = industries.filter(i => i.status === "Compliant").length;
      const nonCompliant = industries.filter(i => i.status === "Non-Compliant").length;
      answer = `There are currently ${violatingCount} industries exceeding emission limits${violatingLocations.length ? `, primarily in the ${violatingLocations.slice(0,2).join(', ')} zone` : ''}, out of ${industries.length} total. Focus inspections on high-emission sectors.`;
      break;
      
    case 'alerts':
      const latestAlerts = alerts.slice(0, 5);
      answer = `Latest environmental alerts (${latestAlerts.length}):\n${latestAlerts.map(a => `• ${a.location}: ${a.message}`).join('\\n')}`;
      break;
      
    case 'forecast':
      const predictions = forecast.predictions || [];
      const avgAqi = predictions.length > 0 ? (predictions.reduce((sum, p) => sum + (p.predicted_aqi || p.value || 0), 0) / predictions.length).toFixed(0) : 'N/A';
      const trend24h = predictions[4]?.predicted_aqi || predictions[4]?.value || 'stable';
      answer = `Predicted pollution trends (24-72h): Average AQI ${avgAqi}, 24h: ${trend24h > 100 ? 'rising' : 'stable'}.`;
      break;
      
    case 'pollution':
      if (airSensors.length > 0) {
        const avgAqi = airSensors.reduce((sum, s) => sum + (s.lastReading.aqi || 0), 0) / airSensors.length;
        const pm25Avg = airSensors.reduce((sum, s) => sum + (s.lastReading.pm25 || 0), 0) / airSensors.length;
        answer = `Average pollution from sensors: AQI ${Math.round(avgAqi)}, PM2.5 ${pm25Avg.toFixed(1)} µg/m³ (${airSensors.length} air sensors).`;
      } else {
        answer = 'No air quality sensor data available.';
      }
      break;
      
    case 'risk':
      const topPolluted = airSensors.sort((a,b) => (b.lastReading.pm25 || 0) - (a.lastReading.pm25 || 0)).slice(0,3);
      answer = topPolluted.length ? `Highest pollution locations: ${topPolluted.map(s => `${s.location}: ${s.lastReading.pm25.toFixed(1)} µg/m³ PM2.5`).join('; ')}.`
 : 'No pollution data available.';
      break;
      
    case 'overview':
      const overview = `Currently ${activeAlertsCount > 0 ? `${activeAlertsCount} active alert${activeAlertsCount === 1 ? '' : 's'}` : 'no active alerts'}, ${violatingCount} industries violating limits${violatingLocations.length ? `, primarily in ${violatingLocations.slice(0,2).join(', ')}` : ''}.`;
      answer = `${overview} Ask about specific risks or forecasts for detailed analysis.`;
      break;
      
    case 'unknown':
      answer = "I'm monitoring environmental data across sensors, industries, alerts, and forecasts. Try asking about pollution levels, alerts, industries, or forecasts.";
      break;
  }

  return {
    answer: answer
  };
}

module.exports = { generateInsight, generateResponse };

