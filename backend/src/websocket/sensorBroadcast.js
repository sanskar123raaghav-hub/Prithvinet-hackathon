/**
 * WebSocket Sensor Broadcast
 * Handles real-time sensor data broadcasting to connected clients.
 * Emits 'sensor-update' events every 5 seconds with simulated live data.
 */

function initSensorBroadcast(io) {
  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Broadcast live sensor updates
    const interval = setInterval(() => {
      socket.emit("sensor-update", {
        timestamp: new Date().toISOString(),
        sensors: [
          {
            id: "S1042",
            type: "air",
            location: "Delhi Central",
            aqi: Math.floor(Math.random() * 50) + 120,
            pm25: (Math.random() * 30 + 60).toFixed(1),
          },
          {
            id: "S2081",
            type: "noise",
            location: "Ahmedabad Industrial",
            decibels: Math.floor(Math.random() * 15) + 65,
          },
          {
            id: "S4501",
            type: "water",
            location: "Chennai Harbor",
            ph: (Math.random() * 0.4 + 7.0).toFixed(1),
            dissolvedOxygen: (Math.random() * 1.0 + 5.0).toFixed(1),
          },
        ],
      });
    }, 5000);

    // Alert threshold events
    socket.on("subscribe-alerts", (thresholds) => {
      console.log(`[WS] Client ${socket.id} subscribed to alerts`, thresholds);
    });

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initSensorBroadcast };
