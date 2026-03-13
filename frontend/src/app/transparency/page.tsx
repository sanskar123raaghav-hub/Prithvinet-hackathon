"use client";

import { motion } from "framer-motion";
import { Globe, Download, FileText, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { month: "Jan", aqi: 95, water: 6.2, noise: 58 },
  { month: "Feb", aqi: 88, water: 6.0, noise: 56 },
  { month: "Mar", aqi: 72, water: 5.8, noise: 60 },
  { month: "Apr", aqi: 65, water: 5.9, noise: 62 },
  { month: "May", aqi: 58, water: 6.1, noise: 59 },
  { month: "Jun", aqi: 52, water: 6.4, noise: 55 },
  { month: "Jul", aqi: 48, water: 6.5, noise: 53 },
  { month: "Aug", aqi: 45, water: 6.3, noise: 54 },
  { month: "Sep", aqi: 55, water: 6.0, noise: 57 },
  { month: "Oct", aqi: 78, water: 5.7, noise: 61 },
  { month: "Nov", aqi: 110, water: 5.5, noise: 63 },
  { month: "Dec", aqi: 125, water: 5.4, noise: 60 },
];

const reports = [
  { title: "Annual Environmental Report 2025", date: "Jan 15, 2026", type: "PDF", size: "4.2 MB" },
  { title: "Q4 2025 Air Quality Analysis", date: "Jan 5, 2026", type: "PDF", size: "2.8 MB" },
  { title: "Water Quality Assessment — Yamuna Basin", date: "Dec 20, 2025", type: "PDF", size: "3.1 MB" },
  { title: "Noise Pollution Study — Metro Cities", date: "Dec 10, 2025", type: "PDF", size: "1.9 MB" },
  { title: "Sensor Network Coverage Report", date: "Nov 30, 2025", type: "PDF", size: "1.2 MB" },
];

export default function TransparencyPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <Globe className="h-6 w-6 text-accent-cyan" />
            Citizen Transparency Portal
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Open access to environmental data and reports for public accountability
          </p>
        </motion.div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Avg AQI (2025)", value: "74", trend: "Moderate" },
            { label: "Water Quality Index", value: "6.0", trend: "Acceptable" },
            { label: "Avg Noise Level", value: "58 dB", trend: "Within Limits" },
            { label: "Compliance Rate", value: "87%", trend: "Good" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center"
            >
              <div className="text-2xl font-mono font-bold text-white">{item.value}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{item.label}</div>
              <div className="text-xs text-accent-cyan font-mono mt-0.5">{item.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* Yearly trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02] mb-8"
        >
          <h3 className="text-sm font-mono text-slate-400 mb-4">
            MONTHLY AIR QUALITY TREND — 2025
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="publicAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1529",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="aqi" stroke="#00e5ff" strokeWidth={2} fill="url(#publicAqi)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-sm font-mono text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PUBLIC REPORTS & DOCUMENTS
          </h3>
          <div className="space-y-2">
            {reports.map((report, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-accent-cyan" />
                  <div>
                    <p className="text-sm text-white">{report.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <Calendar className="h-3 w-3" />
                      {report.date} • {report.type} • {report.size}
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded border border-white/10 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/30 transition-all">
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
