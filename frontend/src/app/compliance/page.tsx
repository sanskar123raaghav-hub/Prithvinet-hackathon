"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Factory,
  MapPin,
  Loader2,
  ArrowUpDown,
  Bell,
} from "lucide-react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useIndustries, useAlerts, type Industry, type Alert } from "@/lib/hooks";

// ── Status config ─────────────────────────────────────────────────────
const statusCfg: Record<
  Industry["status"],
  { color: string; chartColor: string; bg: string; border: string; icon: typeof CheckCircle2; label: string }
> = {
  Compliant: {
    color: "text-accent-green",
    chartColor: "#00ff88",
    bg: "bg-accent-green/10",
    border: "border-accent-green/20",
    icon: CheckCircle2,
    label: "COMPLIANT",
  },
  Warning: {
    color: "text-yellow-400",
    chartColor: "#ffbb33",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    icon: AlertTriangle,
    label: "WARNING",
  },
  "Non-Compliant": {
    color: "text-red-400",
    chartColor: "#ff4444",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: XCircle,
    label: "NON-COMPLIANT",
  },
};

const STATUS_ORDER: Record<string, number> = { "Non-Compliant": 0, Warning: 1, Compliant: 2 };

const tooltipStyle = {
  backgroundColor: "#0d1529",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Page ──────────────────────────────────────────────────────────────
export default function CompliancePage() {
  const { data: indData, loading: indLoading } = useIndustries();
  const { data: alertData, loading: alertsLoading } = useAlerts();
  const [sortAsc, setSortAsc] = useState(true);

  const industries = useMemo(() => indData?.industries ?? [], [indData]);
  const alerts = useMemo(() => alertData?.alerts ?? [], [alertData]);

  // Counts
  const counts = useMemo(() => {
    const c = { total: industries.length, Compliant: 0, Warning: 0, "Non-Compliant": 0 };
    industries.forEach((i) => { c[i.status]++; });
    return c;
  }, [industries]);

  // Sorted table data
  const sorted = useMemo(() => {
    return [...industries].sort((a, b) => {
      const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      return sortAsc ? diff : -diff;
    });
  }, [industries, sortAsc]);

  // Pie chart data
  const pieData = useMemo(
    () =>
      (["Compliant", "Warning", "Non-Compliant"] as const)
        .map((s) => ({ name: s, value: counts[s] }))
        .filter((d) => d.value > 0),
    [counts]
  );

  // Bar chart data — emission levels per industry
  const barData = useMemo(
    () =>
      industries
        .filter((i) => i.emissionLimit != null)
        .map((i) => ({
          name: i.name.length > 18 ? i.name.slice(0, 16) + "…" : i.name,
          emission: i.emissionLimit,
          fill: statusCfg[i.status].chartColor,
        })),
    [industries]
  );

  // Recent severe alerts (critical + warning, max 6)
  const recentAlerts = useMemo(
    () =>
      alerts
        .filter((a) => a.severity === "critical" || a.severity === "warning")
        .slice(0, 6),
    [alerts]
  );

  // Loading
  if (indLoading && alertsLoading) {
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-accent-cyan" />
            Environmental Compliance Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Monitor industry pollution violations and environmental compliance in real-time
          </p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {([
            { label: "Total Industries", value: counts.total, color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20", icon: Factory },
            { label: "Compliant", value: counts.Compliant, color: "text-accent-green", bg: "bg-accent-green/10", border: "border-accent-green/20", icon: CheckCircle2 },
            { label: "Warning", value: counts.Warning, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: AlertTriangle },
            { label: "Non-Compliant", value: counts["Non-Compliant"], color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: XCircle },
          ] as const).map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.border} border`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-mono font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-slate-500 font-mono">{card.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {industries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-12 flex flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-5">
              <Factory className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-mono font-bold text-slate-300 mb-2">No industry data available</h3>
            <p className="text-sm font-mono text-slate-500 mb-6 max-w-md">
              Please add industries in the Industry Registry to start tracking compliance.
            </p>
            <Link
              href="/industries"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-mono rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
            >
              <Factory className="h-4 w-4" />
              Go to Industry Registry
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pie chart — Compliance Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <h3 className="text-sm font-mono text-slate-400 mb-4">COMPLIANCE DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={statusCfg[entry.name as Industry["status"]].chartColor}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      formatter={(value) => <span className="text-xs font-mono text-slate-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Bar chart — Pollution Levels */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <h3 className="text-sm font-mono text-slate-400 mb-4">INDUSTRY EMISSION LIMITS (µg/m³)</h3>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} fontFamily="monospace" angle={-20} textAnchor="end" height={60} />
                      <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="emission" name="Emission Limit" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-slate-600 font-mono text-sm">
                    No emission data available
                  </div>
                )}
              </motion.div>
            </div>

            {/* Industry Compliance Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden mb-8"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Industry Name</th>
                      <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Region</th>
                      <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Emission Limit</th>
                      <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">
                        <button
                          onClick={() => setSortAsc((p) => !p)}
                          className="flex items-center gap-1 hover:text-accent-cyan transition-colors"
                        >
                          Status
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-right px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Map</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((ind) => {
                      const cfg = statusCfg[ind.status];
                      const Icon = cfg.icon;
                      const hasCoords = ind.latitude != null && ind.longitude != null;
                      return (
                        <tr key={ind.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 text-slate-200">{ind.name}</td>
                          <td className="px-5 py-4 text-slate-400">{ind.industryType}</td>
                          <td className="px-5 py-4 text-slate-400">{ind.region}</td>
                          <td className="px-5 py-4 text-slate-400">{ind.emissionLimit != null ? `${ind.emissionLimit} µg/m³` : "—"}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {hasCoords ? (
                              <Link
                                href="/map"
                                title="View on map"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-white/5 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/20 transition-all"
                              >
                                <MapPin className="h-3 w-3" />
                                View
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}

        {/* Alerts Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-sm font-mono text-slate-400 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            RECENT ENVIRONMENTAL ALERTS
          </h3>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-slate-600 font-mono">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ── Alert row ─────────────────────────────────────────────────────────
function AlertRow({ alert }: { alert: Alert }) {
  const isCritical = alert.severity === "critical";
  return (
    <div
      className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
        isCritical
          ? "border-red-400/20 bg-red-400/5"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      <div
        className={`h-2 w-2 mt-1.5 rounded-full flex-shrink-0 ${
          isCritical ? "bg-red-400 animate-pulse" : "bg-yellow-400"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-mono ${isCritical ? "text-red-300" : "text-slate-300"}`}>
          {alert.message}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-mono text-slate-500">{alert.location}</span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs font-mono text-slate-500">{timeAgo(alert.timestamp)}</span>
        </div>
      </div>
      <span
        className={`text-xs font-mono uppercase flex-shrink-0 ${
          isCritical ? "text-red-400" : "text-yellow-400"
        }`}
      >
        {alert.severity}
      </span>
    </div>
  );
}
