"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Clock, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useForecast, type ForecastPrediction } from "@/lib/hooks";

const TYPES = ["air", "water", "noise"] as const;
type PollutionType = (typeof TYPES)[number];

const tooltipStyle = {
  backgroundColor: "#0d1529",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};

function primaryKey(type: PollutionType): string {
  if (type === "air") return "predicted_aqi";
  if (type === "water") return "predicted_ph";
  return "predicted_decibels";
}

function unitLabel(type: PollutionType): string {
  if (type === "air") return "AQI";
  if (type === "water") return "pH";
  return "dB";
}

function predVal(p: ForecastPrediction, type: PollutionType): string {
  if (type === "air") return `${p.predicted_aqi ?? "—"} AQI`;
  if (type === "water") return `${p.predicted_ph ?? "—"} pH`;
  return `${p.predicted_decibels ?? "—"} dB`;
}

export default function ForecastingPage() {
  const [selectedType, setSelectedType] = useState<PollutionType>("air");
  const { data: forecast, loading } = useForecast(selectedType, 72);

  const chartData = useMemo(() => {
    if (!forecast?.predictions) return [];
    const key = primaryKey(selectedType);
    return forecast.predictions.map((p) => ({
      hour: p.hour,
      value: ((p as unknown) as Record<string, number>)[key] ?? 0,
      confidence: p.confidence,
    }));
  }, [forecast, selectedType]);

  // Pick 3 summary points: now, +24h, last
  const summaryCards = useMemo(() => {
    const preds = forecast?.predictions ?? [];
    if (preds.length === 0) return [];
    const now = preds[0];
    const mid = preds.find((p) => p.hour === "+24h") ?? preds[Math.min(4, preds.length - 1)];
    const last = preds[preds.length - 1];
    return [
      { label: "Now", pred: now },
      { label: "+24h", pred: mid },
      { label: `+${forecast?.forecastHours ?? forecast?.forecast_hours ?? 72}h`, pred: last },
    ];
  }, [forecast]);

  const model = forecast?.model ?? "PRITHVINET-FORECAST v2.4";
  const algorithm = forecast?.algorithm ?? "LSTM + Transformer Ensemble";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <Brain className="h-6 w-6 text-accent-green" />
            AI Pollution Forecasting
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Machine learning predictions for the next 24–72 hours
          </p>
        </motion.div>

        {/* Model info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border border-accent-green/20 bg-accent-green/5 mb-8 flex items-center gap-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/10">
            <Brain className="h-5 w-5 text-accent-green" />
          </div>
          <div>
            <p className="text-sm text-white font-mono">
              {model} • {algorithm}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Generated: {forecast?.generatedAt ?? forecast?.generated_at ?? "—"}
            </p>
          </div>
        </motion.div>

        {/* Type selector */}
        <div className="flex items-center gap-2 mb-6">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 text-xs font-mono rounded-lg border transition-all ${
                selectedType === t
                  ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                  : "border-white/10 text-slate-400 hover:bg-white/5"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Forecast chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02] mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-slate-400">
              {selectedType.toUpperCase()} FORECAST — 72 HOUR PREDICTION
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <div className="h-2 w-6 bg-accent-green rounded" />
              Predicted ({unitLabel(selectedType)})
            </div>
          </div>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-accent-cyan animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#475569" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
                <Tooltip contentStyle={tooltipStyle} />
                {selectedType === "air" && (
                  <ReferenceLine y={100} stroke="#ff4444" strokeDasharray="5 5" label={{ value: "Threshold", fill: "#ff4444", fontSize: 11 }} />
                )}
                <Line type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#00ff88" }} name={unitLabel(selectedType)} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Prediction summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <h4 className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {card.label}
              </h4>
              <div className="text-2xl font-mono font-bold text-white mb-2">
                {predVal(card.pred, selectedType)}
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Confidence</span>
                  <span className="text-xs font-mono text-accent-cyan">{card.pred.confidence}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-accent-cyan"
                    style={{ width: `${card.pred.confidence}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
