"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wind,
  Droplets,
  Volume2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Loader2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

import { useLatestSensors, useAlerts, useForecast, type Sensor } from "@/lib/hooks";
import { useSocket } from "@/lib/useSocket";

// ── Helpers ───────────────────────────────────────────────────────────
function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getAirSummary(sensors: Sensor[]) {
  const airSensors = sensors.filter((s) => s.type === "air");
  if (airSensors.length === 0) return { avg: 0 };
  const sum = airSensors.reduce((acc, s) => acc + (s.lastReading?.aqi ?? 0), 0);
  return { avg: Math.round(sum / airSensors.length) };
}

function getWaterSummary(sensors: Sensor[]) {
  const ws = sensors.filter((s) => s.type === "water");
  if (ws.length === 0) return { avgPh: 0 };
  const sum = ws.reduce((a, s) => a + (s.lastReading?.ph ?? 0), 0);
  return { avgPh: +(sum / ws.length).toFixed(1) };
}

function getNoiseSummary(sensors: Sensor[]) {
  const ns = sensors.filter((s) => s.type === "noise");
  if (ns.length === 0) return { avgDb: 0 };
  const sum = ns.reduce((a, s) => a + (s.lastReading?.decibels ?? 0), 0);
  return { avgDb: Math.round(sum / ns.length) };
}

const tooltipStyle = {
  backgroundColor: "#0d1529",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};

const statusColors: Record<string, string> = {
  good: "text-accent-green",
  warning: "text-yellow-400",
  alert: "text-red-400",
};

// ── Component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  // API data
  const { data: sensorData, loading: sensorsLoading } = useLatestSensors();
  const { data: alertData, loading: alertsLoading } = useAlerts();
  const { data: forecastData } = useForecast("air", 72);

  // WebSocket
  const { connected, liveSensors, lastUpdate } = useSocket();

  // Merge live WS data over REST snapshots
  const sensors = useMemo(() => {
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

  const alerts = alertData?.alerts ?? [];
  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  const air = getAirSummary(sensors);
  const water = getWaterSummary(sensors);
  const noise = getNoiseSummary(sensors);

  // Stat cards from live data
  const stats = [
    {
      label: "Air Quality Index",
      value: String(air.avg),
      unit: "AQI",
      change: air.avg <= 50 ? "Good" : air.avg <= 100 ? "Moderate" : "Poor",
      trend: air.avg <= 50 ? ("down" as const) : ("up" as const),
      icon: Wind,
      status: air.avg <= 50 ? "good" : air.avg <= 100 ? "warning" : "alert",
    },
    {
      label: "Water Quality",
      value: String(water.avgPh),
      unit: "pH",
      change: water.avgPh >= 6.5 && water.avgPh <= 8.5 ? "Normal" : "Alert",
      trend: "up" as const,
      icon: Droplets,
      status: water.avgPh >= 6.5 && water.avgPh <= 8.5 ? "good" : "warning",
    },
    {
      label: "Noise Level",
      value: String(noise.avgDb),
      unit: "dB",
      change: noise.avgDb <= 65 ? "Acceptable" : "Elevated",
      trend: noise.avgDb <= 65 ? ("down" as const) : ("up" as const),
      icon: Volume2,
      status: noise.avgDb <= 65 ? "good" : "warning",
    },
    {
      label: "Active Alerts",
      value: String(unacknowledged.length),
      unit: "",
      change: `${alerts.length} total`,
      trend: unacknowledged.length > 2 ? ("up" as const) : ("down" as const),
      icon: AlertTriangle,
      status: unacknowledged.length > 2 ? "alert" : unacknowledged.length > 0 ? "warning" : "good",
    },
  ];

  // Water quality bar data from water sensors
  const waterBarData = useMemo(() => {
    const ws = sensors.filter((s) => s.type === "water");
    if (ws.length === 0) {
      return [
        { param: "pH", value: 7.2, limit: 8.5 },
        { param: "DO", value: 5.8, limit: 6.0 },
        { param: "BOD", value: 2.4, limit: 3.0 },
      ];
    }
    const first = ws[0].lastReading ?? {};
    return [
      { param: "pH", value: first.ph ?? 7.0, limit: 8.5 },
      { param: "DO", value: first.dissolvedOxygen ?? 5.0, limit: 6.0 },
      { param: "BOD", value: first.bod ?? 2.0, limit: 3.0 },
    ];
  }, [sensors]);

  // Forecast chart data
  const forecastChartData = useMemo(() => {
    if (!forecastData?.predictions) return [];
    return forecastData.predictions.slice(0, 13).map((p) => ({
      hour: p.hour,
      predicted_aqi: p.predicted_aqi ?? 0,
      confidence: p.confidence,
    }));
  }, [forecastData]);

  // Loading state
  if (sensorsLoading && alertsLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white font-mono">
              Environmental Dashboard
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
          <p className="text-sm text-slate-500 font-mono">
            Last updated:{" "}
            {lastUpdate
              ? new Date(lastUpdate.timestamp).toLocaleString()
              : new Date().toLocaleString()}{" "}
            • {sensors.length} sensors reporting
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <stat.icon
                    className={`h-5 w-5 ${statusColors[stat.status]}`}
                  />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-mono ${
                    stat.trend === "down"
                      ? "text-accent-green"
                      : stat.status === "good"
                      ? "text-accent-green"
                      : "text-yellow-400"
                  }`}
                >
                  {stat.trend === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {stat.value}
                <span className="text-sm text-slate-500 ml-1">{stat.unit}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map shortcut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <Link
            href="/map"
            className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-accent-cyan/5 hover:border-accent-cyan/20 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 group-hover:bg-accent-cyan/20 transition-colors">
              <MapPin className="h-5 w-5 text-accent-cyan" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-mono font-bold text-white">
                Geospatial Pollution Map
              </span>
              <span className="block text-xs font-mono text-slate-500">
                View live sensor markers across India
              </span>
            </div>
            <span className="text-xs font-mono text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
              Open &rarr;
            </span>
          </Link>
        </motion.div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AQI Forecast Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-sm font-mono text-slate-400 mb-4">
              AQI FORECAST — 72H PREDICTION
            </h3>
            {forecastChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" stroke="#475569" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="predicted_aqi" stroke="#00ff88" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#00ff88" }} name="Predicted AQI" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-600 font-mono text-sm">
                Loading forecast data…
              </div>
            )}
          </motion.div>

          {/* Water Quality Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-sm font-mono text-slate-400 mb-4">
              WATER QUALITY PARAMETERS
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waterBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="param" stroke="#475569" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#00ff88" radius={[4, 4, 0, 0]} name="Measured" />
                <Bar dataKey="limit" fill="#1e293b" radius={[4, 4, 0, 0]} name="Limit" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Noise level per-sensor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02] mb-8"
        >
          <h3 className="text-sm font-mono text-slate-400 mb-4">
            NOISE LEVELS BY SENSOR
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={sensors
                .filter((s) => s.type === "noise")
                .map((s) => ({
                  location: s.location.split(" ")[0],
                  decibels: s.lastReading?.decibels ?? 0,
                }))}
            >
              <defs>
                <linearGradient id="noiseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="location" stroke="#475569" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="decibels" stroke="#00e5ff" strokeWidth={2} fill="url(#noiseGrad)" name="dB" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-sm font-mono text-slate-400 mb-4">
            RECENT ALERTS
          </h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-600 font-mono">No alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      alert.severity === "critical"
                        ? "bg-red-400"
                        : alert.severity === "warning"
                        ? "bg-yellow-400"
                        : "bg-accent-cyan"
                    } ${!alert.acknowledged ? "animate-pulse" : ""}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-accent-cyan">
                        {alert.type}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 truncate">
                      {alert.message}
                    </p>
                  </div>
                  {alert.acknowledged ? (
                    <CheckCircle2 className="h-4 w-4 text-accent-green flex-shrink-0" />
                  ) : (
                    <span className="text-xs font-mono text-red-400 uppercase flex-shrink-0">
                      {alert.severity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
