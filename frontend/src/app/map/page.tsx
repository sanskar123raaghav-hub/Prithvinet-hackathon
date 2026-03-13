"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Layers, Filter, Wifi, WifiOff, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet.css";
import { useLatestSensors, type Sensor } from "@/lib/hooks";
import { useSocket } from "@/lib/useSocket";
import { AQI_LEVELS } from "@/lib/constants";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------
function getSeverityColor(sensor: Sensor): string {
  const r = sensor.lastReading;
  if (!r) return "#475569"; // no data — slate

  if (sensor.type === "air") {
    const aqi = r.aqi ?? 0;
    if (aqi <= AQI_LEVELS.GOOD.max) return AQI_LEVELS.GOOD.color;
    if (aqi <= AQI_LEVELS.MODERATE.max) return AQI_LEVELS.MODERATE.color;
    if (aqi <= AQI_LEVELS.POOR.max) return AQI_LEVELS.POOR.color;
    return AQI_LEVELS.HAZARDOUS.color;
  }

  if (sensor.type === "water") {
    const ph = r.ph ?? 7;
    if (ph >= 6.5 && ph <= 8.5) return AQI_LEVELS.GOOD.color;
    if (ph >= 6.0 && ph <= 9.0) return AQI_LEVELS.MODERATE.color;
    return AQI_LEVELS.HAZARDOUS.color;
  }

  if (sensor.type === "noise") {
    const db = r.decibels ?? 0;
    if (db <= 55) return AQI_LEVELS.GOOD.color;
    if (db <= 65) return AQI_LEVELS.MODERATE.color;
    if (db <= 75) return AQI_LEVELS.POOR.color;
    return AQI_LEVELS.HAZARDOUS.color;
  }

  return "#475569";
}

function getSeverityLabel(sensor: Sensor): string {
  const color = getSeverityColor(sensor);
  if (color === AQI_LEVELS.GOOD.color) return "Good";
  if (color === AQI_LEVELS.MODERATE.color) return "Moderate";
  if (color === AQI_LEVELS.POOR.color) return "Poor";
  if (color === AQI_LEVELS.HAZARDOUS.color) return "Hazardous";
  return "N/A";
}

// ---------------------------------------------------------------------------
// Build readable metrics string for popup
// ---------------------------------------------------------------------------
function getMetrics(sensor: Sensor): { label: string; value: string }[] {
  const r = sensor.lastReading;
  if (!r) return [];
  const m: { label: string; value: string }[] = [];

  if (r.aqi != null) m.push({ label: "AQI", value: String(r.aqi) });
  if (r.pm25 != null) m.push({ label: "PM2.5", value: `${r.pm25} µg/m³` });
  if (r.pm10 != null) m.push({ label: "PM10", value: `${r.pm10} µg/m³` });
  if (r.ph != null) m.push({ label: "pH", value: String(r.ph) });
  if (r.dissolvedOxygen != null) m.push({ label: "DO", value: `${r.dissolvedOxygen} mg/L` });
  if (r.bod != null) m.push({ label: "BOD", value: `${r.bod} mg/L` });
  if (r.decibels != null) m.push({ label: "Noise", value: `${r.decibels} dB` });
  if (r.peakDb != null) m.push({ label: "Peak", value: `${r.peakDb} dB` });

  return m;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // REST data (has lat / lng)
  const { data: sensorData, loading } = useLatestSensors();

  // Live WebSocket stream
  const { connected, liveSensors, lastUpdate } = useSocket();

  // Merge live WS readings over REST snapshot (same pattern as dashboard)
  const sensors: Sensor[] = useMemo(() => {
    const base = sensorData?.sensors ?? [];
    if (liveSensors.length === 0) return base;
    return base.map((s) => {
      const live = liveSensors.find((ls) => ls.id === s.id);
      if (!live) return s;
      return {
        ...s,
        lastReading: {
          ...s.lastReading,
          aqi: live.aqi ?? s.lastReading?.aqi,
          pm25: live.pm25 ?? s.lastReading?.pm25,
          decibels: live.decibels ?? s.lastReading?.decibels,
          ph: live.ph ?? s.lastReading?.ph,
          dissolvedOxygen: live.dissolvedOxygen ?? s.lastReading?.dissolvedOxygen,
          timestamp: lastUpdate?.timestamp ?? s.lastReading?.timestamp,
        },
      };
    });
  }, [sensorData, liveSensors, lastUpdate]);

  const filtered = activeFilter === "all" ? sensors : sensors.filter((s) => s.type === activeFilter);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              <MapPin className="h-6 w-6 text-accent-cyan" />
              Geospatial Pollution Map
            </h1>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                connected
                  ? "bg-accent-green/10 border-accent-green/20"
                  : "bg-yellow-400/10 border-yellow-400/20"
              }`}
            >
              {connected ? (
                <Wifi className="h-3 w-3 text-accent-green" />
              ) : (
                <WifiOff className="h-3 w-3 text-yellow-400" />
              )}
              <span
                className={`text-xs font-mono ${
                  connected ? "text-accent-green" : "text-yellow-400"
                }`}
              >
                {connected ? "LIVE" : "CONNECTING"}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Real-time sensor data plotted across monitored regions &bull;{" "}
            {lastUpdate
              ? `Updated ${new Date(lastUpdate.timestamp).toLocaleTimeString()}`
              : "Waiting for data"}{" "}
            &bull; {sensors.length} stations
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-4"
        >
          <Filter className="h-4 w-4 text-slate-500" />
          {["all", "air", "water", "noise"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                activeFilter === filter
                  ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                  : "border-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/5 overflow-hidden"
          style={{ height: "600px" }}
        >
          {loading && !mounted ? (
            <div className="h-full flex items-center justify-center bg-navy-800">
              <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
            </div>
          ) : mounted ? (
            <MapContainer
              center={[22.5, 78.9]}
              zoom={5}
              style={{ height: "100%", width: "100%", background: "#0a0f1e" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {filtered.map((sensor) => {
                const color = getSeverityColor(sensor);
                const severity = getSeverityLabel(sensor);
                const metrics = getMetrics(sensor);

                return (
                  <CircleMarker
                    key={sensor.id}
                    center={[sensor.lat, sensor.lng]}
                    radius={12}
                    fillColor={color}
                    color={color}
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.4}
                  >
                    <Popup>
                      <div className="font-mono text-xs space-y-1 min-w-[180px]">
                        <div className="text-[11px] font-bold tracking-wide" style={{ color }}>
                          {severity.toUpperCase()}
                        </div>
                        <div className="font-bold text-sm text-slate-200">
                          {sensor.location}
                        </div>
                        <div className="text-slate-400">
                          Sensor ID: <span className="text-accent-cyan">{sensor.id}</span>
                        </div>
                        <div className="text-slate-400">
                          Type: <span className="text-slate-200">{sensor.type}</span>
                        </div>
                        {metrics.length > 0 && (
                          <div className="border-t border-white/10 pt-1 mt-1 space-y-0.5">
                            {metrics.map((m) => (
                              <div key={m.label} className="flex justify-between">
                                <span className="text-slate-400">{m.label}</span>
                                <span className="text-slate-200">{m.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {sensor.lastReading?.timestamp && (
                          <div className="text-[10px] text-slate-500 pt-1">
                            {new Date(sensor.lastReading.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          ) : null}
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-mono text-slate-500">
          <Layers className="h-4 w-4" />
          {Object.values(AQI_LEVELS).map((level) => (
            <div key={level.label} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: level.color }}
              />
              {level.label} ({level.min}–{level.max})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
