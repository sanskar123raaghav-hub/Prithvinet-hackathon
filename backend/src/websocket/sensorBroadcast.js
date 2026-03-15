/**
 * WebSocket Sensor Broadcast
 * Handles real-time sensor data broadcasting to connected clients.
 * Emits 'sensor-update' events every 5 seconds with simulated live data.
 */

const SensorService = require("../services/sensorService");
const AlertService = require("../services/alertService");

function initSensorBroadcast(io) {
  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Global broadcast + persistence + alert checking
    const interval = setInterval(async () => {
      const timestamp = new Date().toISOString();
      const sensors = [
        {
          id: "S1042",
          type: "air",
          location: "Delhi Central",
          aqi: Math.floor(Math.random() * 50) + 120,
          pm25: (Math.random() < 0.15 ? 155 + Math.random() * 20 : Math.random() * 30 + 60).toFixed(1), // 15% chance violation
        },
        {
          id: "S2081",
          type: "noise",
          location: "Ahmedabad Industrial",
          decibels: (Math.random() < 0.1 ? 88 + Math.random() * 5 : Math.random() * 15 + 65).toFixed(1), // 10% violation
        },
        {
          id: "S4501",
          type: "water",
          location: "Chennai Harbor",
          ph: (Math.random() < 0.08 ? (Math.random() < 0.5 ? 6.2 : 8.8) : Math.random() * 0.4 + 7.0).toFixed(1), // 8% pH violation
          dissolvedOxygen: (Math.random() * 1.0 + 5.0).toFixed(1),
        },
      ];

      // Persist readings and check alerts for each sensor
      for (const sensor of sensors) {
        try {
          const readingData = {};
          if (sensor.pm25 !== undefined) readingData.pm25 = parseFloat(sensor.pm25);
          if (sensor.decibels !== undefined) readingData.decibels = parseFloat(sensor.decibels);
          if (sensor.peak_db !== undefined) readingData.peak_db = parseFloat(sensor.peak_db);
          if (sensor.ph !== undefined) readingData.ph = parseFloat(sensor.ph);
          // Add more as needed

          await SensorService.saveReading(sensor.id, readingData);
          await AlertService.createAlertIfThresholdExceeded(sensor.id, readingData);
        } catch (err) {
          console.error(`[WS] Error processing sensor ${sensor.id}:`, err.message);
        }
      }

      // Broadcast to all connected clients
      io.emit("sensor-update", { timestamp, sensors });
    }, 5000);

    // Alert threshold events
    socket.on("subscribe-alerts", (thresholds) => {
      console.log(`[WS] Client ${socket.id} subscribed to alerts`, thresholds);
    });

    socket.on("disconnect", () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initSensorBroadcast };
