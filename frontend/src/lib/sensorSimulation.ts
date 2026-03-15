interface SensorStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  AQI: number;
  PM25: number;
  CO2: number;
  Noise: number;
  Temperature: number;
  Humidity: number;
  lastUpdated: string;
}

export const INITIAL_STATIONS: SensorStation[] = [
  { id: 'S1', name: 'City Center', latitude: 21.2514, longitude: 81.6296, AQI: 85, PM25: 45, CO2: 420, Noise: 68, Temperature: 32.5, Humidity: 72, lastUpdated: new Date().toISOString() },
  { id: 'S2', name: 'Industrial Zone', latitude: 21.241, longitude: 81.642, AQI: 142, PM25: 78, CO2: 480, Noise: 82, Temperature: 33.1, Humidity: 68, lastUpdated: new Date().toISOString() },
  { id: 'S3', name: 'Residential Area', latitude: 21.265, longitude: 81.610, AQI: 210, PM25: 95, CO2: 520, Noise: 75, Temperature: 31.8, Humidity: 78, lastUpdated: new Date().toISOString() },
  { id: 'S4', name: 'Park Area', latitude: 21.235, longitude: 81.615, AQI: 65, PM25: 32, CO2: 405, Noise: 62, Temperature: 32.9, Humidity: 75, lastUpdated: new Date().toISOString() },
  { id: 'S5', name: 'Highway Side', latitude: 21.260, longitude: 81.645, AQI: 175, PM25: 88, CO2: 495, Noise: 79, Temperature: 33.4, Humidity: 70, lastUpdated: new Date().toISOString() },
  { id: 'S6', name: 'School Zone', latitude: 21.245, longitude: 81.605, AQI: 38, PM25: 22, CO2: 410, Noise: 55, Temperature: 32.2, Humidity: 80, lastUpdated: new Date().toISOString() },
  { id: 'S7', name: 'Market Area', latitude: 21.255, longitude: 81.655, AQI: 198, PM25: 92, CO2: 510, Noise: 84, Temperature: 33.0, Humidity: 69, lastUpdated: new Date().toISOString() },
  { id: 'S8', name: 'Suburb', latitude: 21.270, longitude: 81.620, AQI: 112, PM25: 58, CO2: 455, Noise: 71, Temperature: 32.7, Humidity: 74, lastUpdated: new Date().toISOString() },
];

export function generateRandomSensorData(): SensorStation {
  const baseAQI = 30 + Math.random() * 220;
  return {
    id: `S${Math.floor(Math.random() * 1000)}`,
    name: `Sensor ${Math.floor(Math.random() * 100)}`,
    latitude: 21.25 + (Math.random() - 0.5) * 0.05,
    longitude: 81.63 + (Math.random() - 0.5) * 0.05,
    AQI: Math.round(baseAQI),
    PM25: +(10 + baseAQI * 0.6).toFixed(1),
    CO2: Math.round(350 + Math.random() * 550),
    Noise: Math.round(40 + Math.random() * 60),
    Temperature: +(20 + Math.random() * 20).toFixed(1),
    Humidity: Math.round(20 + Math.random() * 60),
    lastUpdated: new Date().toISOString(),
  };
}

// Utility function for pure logic (use in React components)
export function updateSensors(prevSensors: SensorStation[]): SensorStation[] {
  return prevSensors.map((sensor: SensorStation) => {
    const delta = (Math.random() - 0.5) * 10;
    return {
      ...sensor,
      AQI: Math.max(30, Math.min(250, sensor.AQI + delta)),
      PM25: +(Math.max(10, Math.min(180, sensor.PM25 + (Math.random() - 0.5) * 5)).toFixed(1)),
      CO2: Math.max(350, Math.min(900, sensor.CO2 + (Math.random() - 0.5) * 20)),
      Noise: Math.max(40, Math.min(100, sensor.Noise + (Math.random() - 0.5) * 3)),
      Temperature: +(Math.max(20, Math.min(40, sensor.Temperature + (Math.random() - 0.5) * 0.5)).toFixed(1)),
      Humidity: Math.max(20, Math.min(80, sensor.Humidity + (Math.random() - 0.5) * 2)),
      lastUpdated: new Date().toISOString(),
    };
  });
}


