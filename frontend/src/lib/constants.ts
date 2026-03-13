/**
 * PRITHVINET Constants
 * Environmental thresholds, configuration values, and AQI color mappings.
 */

export const AQI_LEVELS = {
  GOOD: { min: 0, max: 50, label: "Good", color: "#00ff88" },
  MODERATE: { min: 51, max: 100, label: "Moderate", color: "#00e5ff" },
  POOR: { min: 101, max: 150, label: "Poor", color: "#ffbb33" },
  HAZARDOUS: { min: 151, max: 500, label: "Hazardous", color: "#ff4444" },
};

export const WATER_LIMITS = {
  PH: { min: 6.5, max: 8.5, unit: "pH" },
  DISSOLVED_OXYGEN: { min: 5.0, unit: "mg/L" },
  BOD: { max: 3.0, unit: "mg/L" },
  TSS: { max: 30, unit: "mg/L" },
  COLIFORM: { max: 500, unit: "MPN/100mL" },
};

export const NOISE_LIMITS = {
  INDUSTRIAL: { day: 75, night: 70, unit: "dB" },
  COMMERCIAL: { day: 65, night: 55, unit: "dB" },
  RESIDENTIAL: { day: 55, night: 45, unit: "dB" },
  SILENCE: { day: 50, night: 40, unit: "dB" },
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";
