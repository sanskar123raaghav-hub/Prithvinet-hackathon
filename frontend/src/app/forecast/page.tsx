"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Loader2,
  Lightbulb,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ── Types ─────────────────────────────────────────────────────────── */
interface ForecastPoint {
  timestamp: string;
  predicted_value: number;
  uncertainty: number;
}

interface ForecastData {
  location: string;
  parameter: string;
  generatedAt: string;
  forecastHours: number;
  forecast: ForecastPoint[];
}

/* ── Helpers ───────────────────────────────────────────────────────── */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function fmtHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function severity(val: number): "good" | "moderate" | "poor" | "hazardous" {
  if (val <= 30) return "good";
  if (val <= 60) return "moderate";
  if (val <= 100) return "poor";
  return "hazardous";
}

const tooltipStyle = {
  backgroundColor: "#0d1529",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};

/* ── Rule-based AI Insights ────────────────────────────────────────── */
function generateInsights(
  peak: ForecastPoint | null,
  safeCount: number,
  highRiskCount: number,
  total: number
) {
  const msgs: string[] = [];

  if (peak) {
    const sev = severity(peak.predicted_value);
    if (sev === "hazardous")
      msgs.push(
        `⚠️ Predicted peak of ${peak.predicted_value} µg/m³ is in the hazardous range. Consider issuing a public health advisory.`
      );
    else if (sev === "poor")
      msgs.push(
        `🟠 Peak pollution of ${peak.predicted_value} µg/m³ expected. Sensitive groups should limit outdoor activity.`
      );
    else
      msgs.push(
        `✅ Peak pollution remains within acceptable limits at ${peak.predicted_value} µg/m³.`
      );
  }

  if (safeCount > total * 0.7)
    msgs.push(
      "🌿 Over 70% of the forecast period shows safe pollution levels — good conditions expected."
    );
  else if (highRiskCount > total * 0.4)
    msgs.push(
      "🔴 More than 40% of the forecast window is high-risk. Increased monitoring recommended."
    );

  if (peak && peak.uncertainty > 12)
    msgs.push(
      "📊 High uncertainty detected in later forecast hours. Predictions will improve as new sensor data arrives."
    );
  else
    msgs.push(
      "📊 Forecast confidence is strong across the prediction window."
    );

  return msgs;
}

/* ── Page Component ────────────────────────────────────────────────── */
export default function ForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/ai-forecast`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ForecastData) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  /* Chart data with upper / lower uncertainty bands */
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.forecast.map((p) => ({
      time: fmtHour(p.timestamp),
      value: p.predicted_value,
      upper: +(p.predicted_value + p.uncertainty).toFixed(1),
      lower: Math.max(0, +(p.predicted_value - p.uncertainty).toFixed(1)),
      uncertainty: p.uncertainty,
    }));
  }, [data]);

  /* Insight card metrics */
  const metrics = useMemo(() => {
    if (!data) return null;
    const pts = data.forecast;
    const peak = pts.reduce(
      (a, b) => (b.predicted_value > a.predicted_value ? b : a),
      pts[0]
    );
    const safeHours = pts.filter((p) => p.predicted_value <= 60);
    const highRisk = pts.filter((p) => p.predicted_value > 100);

    // Find longest high-risk window
    let maxRun = 0;
    let run = 0;
    let runStart = "";
    let bestStart = "";
    let bestEnd = "";
    for (const p of pts) {
      if (p.predicted_value > 100) {
        if (run === 0) runStart = p.timestamp;
        run++;
        if (run > maxRun) {
          maxRun = run;
          bestStart = runStart;
          bestEnd = p.timestamp;
        }
      } else {
        run = 0;
      }
    }

    return {
      peak,
      safeCount: safeHours.length,
      highRiskCount: highRisk.length,
      highRiskWindow:
        maxRun > 0
          ? `${fmtHour(bestStart)} — ${fmtHour(bestEnd)}`
          : "None detected",
      total: pts.length,
    };
  }, [data]);

  const insights = useMemo(() => {
    if (!metrics) return [];
    return generateInsights(
      metrics.peak,
      metrics.safeCount,
      metrics.highRiskCount,
      metrics.total
    );
  }, [metrics]);

  /* ── Render ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-red-400 font-mono text-sm">
        Failed to load forecast{error ? `: ${error}` : ""}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <Brain className="h-6 w-6 text-accent-green" />
            Environmental Forecast Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            {data.parameter} predictions for {data.location} — next{" "}
            {data.forecastHours} hours
          </p>
        </motion.div>

        {/* ── Insight Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Predicted Peak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
              <TrendingUp className="h-4 w-4 text-red-400" />
              Predicted Peak Pollution
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {metrics?.peak.predicted_value ?? "—"}{" "}
              <span className="text-sm text-slate-400">µg/m³</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Expected at {metrics ? fmtHour(metrics.peak.timestamp) : "—"}
            </p>
          </motion.div>

          {/* Safe Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
              <ShieldCheck className="h-4 w-4 text-accent-green" />
              Safe Hours
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {metrics?.safeCount ?? "—"}{" "}
              <span className="text-sm text-slate-400">
                / {metrics?.total ?? 72} hrs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Hours with PM2.5 ≤ 60 µg/m³
            </p>
          </motion.div>

          {/* High Risk Period */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              High Risk Period
            </div>
            <div className="text-lg font-mono font-bold text-white leading-tight">
              {metrics?.highRiskWindow}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {metrics?.highRiskCount ?? 0} hours above 100 µg/m³
            </p>
          </motion.div>
        </div>

        {/* ── Forecast Chart with Uncertainty Band ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02] mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">
              PM2.5 FORECAST — 72 HOUR PREDICTION
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-6 bg-accent-green rounded" />
                Predicted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-6 bg-accent-cyan/30 rounded" />
                Uncertainty
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="uncertaintyGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#475569"
                fontSize={10}
                fontFamily="monospace"
                interval={11}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                fontFamily="monospace"
                label={{
                  value: "µg/m³",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748b",
                  fontSize: 11,
                }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine
                y={60}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{
                  value: "Moderate",
                  fill: "#f59e0b",
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={100}
                stroke="#ff4444"
                strokeDasharray="5 5"
                label={{
                  value: "Unhealthy",
                  fill: "#ff4444",
                  fontSize: 10,
                }}
              />
              {/* Uncertainty upper band */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#uncertaintyGrad)"
                name="Upper bound"
              />
              {/* Uncertainty lower band (invisible fill to create band effect) */}
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#0d1529"
                name="Lower bound"
              />
              {/* Main predicted line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00ff88"
                strokeWidth={2}
                dot={false}
                name="PM2.5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── AI Insights Panel ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5"
        >
          <h3 className="text-sm font-mono text-accent-cyan flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4" />
            AI INSIGHTS
          </h3>
          <div className="space-y-3">
            {insights.map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-slate-300 font-mono leading-relaxed"
              >
                <Clock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                {msg}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 font-mono mt-4">
            Generated at {data.generatedAt} • Model: PRITHVINET-FORECAST v2.4
          </p>
        </motion.div>
      </div>
    </div>
  );
}
