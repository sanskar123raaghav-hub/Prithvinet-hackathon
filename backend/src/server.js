require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./models/db");

const authRoutes = require("./routes/auth");
const sensorRoutes = require("./routes/sensors");
const alertRoutes = require("./routes/alerts");
const reportRoutes = require("./routes/reports");
const forecastRoutes = require("./routes/forecast");
const industryRoutes = require("./routes/industries");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "operational",
    service: "PRITHVINET API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/industries", industryRoutes);

// WebSocket for real-time data
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Simulate real-time sensor data broadcast
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

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await db.init();
  server.listen(PORT, () => {
    console.log(`PRITHVINET API server running on port ${PORT}`);
    console.log(`WebSocket server active`);
  });
}

start();
