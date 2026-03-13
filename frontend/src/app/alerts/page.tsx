"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, CheckCircle2, Clock, MapPin, Loader2 } from "lucide-react";
import { useAlerts, type Alert } from "@/lib/hooks";
import { api } from "@/lib/api";

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityConfig: Record<string, { dot: string; bg: string; border: string }> = {
  critical: { dot: "bg-red-400", bg: "bg-red-400/5", border: "border-red-400/20" },
  warning: { dot: "bg-yellow-400", bg: "bg-yellow-400/5", border: "border-yellow-400/20" },
  info: { dot: "bg-accent-cyan", bg: "bg-accent-cyan/5", border: "border-accent-cyan/20" },
};

export default function AlertsPage() {
  const { data, loading, refetch } = useAlerts();
  const [acking, setAcking] = useState<number | null>(null);

  const alerts: Alert[] = data?.alerts ?? [];

  async function handleAcknowledge(id: number) {
    setAcking(id);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("prithvinet_token") : null;
      if (token) {
        await api.acknowledgeAlert(id, token);
      }
      await refetch();
    } catch {
      // still refetch to show latest state
      await refetch();
    } finally {
      setAcking(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <BellRing className="h-6 w-6 text-yellow-400" />
            Smart Alerts
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Threshold-based environmental alerts with escalation tracking
          </p>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Critical", count: alerts.filter((a) => a.severity === "critical").length, color: "text-red-400" },
            { label: "Warnings", count: alerts.filter((a) => a.severity === "warning").length, color: "text-yellow-400" },
            { label: "Unacknowledged", count: alerts.filter((a) => !a.acknowledged).length, color: "text-accent-cyan" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <div className={`text-3xl font-mono font-bold ${item.color}`}>{item.count}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const sev = severityConfig[alert.severity] ?? severityConfig.info;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`p-4 rounded-xl border ${sev.border} ${alert.acknowledged ? "bg-white/[0.01]" : sev.bg}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-3 w-3 rounded-full mt-1 ${sev.dot} ${!alert.acknowledged ? "animate-pulse" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-accent-cyan">{alert.type}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-500 uppercase">{alert.severity}</span>
                    </div>
                    <p className="text-sm text-white mb-1">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                  {alert.acknowledged ? (
                    <CheckCircle2 className="h-5 w-5 text-accent-green flex-shrink-0" />
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acking === alert.id}
                      className="px-3 py-1 text-xs font-mono rounded border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0 disabled:opacity-50"
                    >
                      {acking === alert.id ? "..." : "Acknowledge"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
