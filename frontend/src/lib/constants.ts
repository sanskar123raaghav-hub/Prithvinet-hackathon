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

export const RISK_THRESHOLDS = {
  AQI: 150,
  NOISE: 75,
  DISSOLVED_OXYGEN_MIN: 4.0
} as const;

export const CITY_COORDS: Record<string, [number, number]> = {
  Delhi: [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.3850, 78.4867],
  Ahmedabad: [23.0225, 72.5714],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462]
} as const;

export const ICON_MAP: Record<string, string> = {
  air: "Cloud",
  water: "Droplets",
  noise: "Volume2"
} as const;
