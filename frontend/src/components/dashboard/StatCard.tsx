"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  status: "good" | "warning" | "alert";
  delay?: number;
}

const statusColors: Record<string, string> = {
  good: "text-accent-green",
  warning: "text-yellow-400",
  alert: "text-red-400",
};

export default function StatCard({
  label,
  value,
  unit,
  change,
  trend,
  icon: Icon,
  status,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
          <Icon className={`h-5 w-5 ${statusColors[status]}`} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-mono ${
            trend === "down" ? "text-accent-green" : status === "good" ? "text-accent-green" : "text-yellow-400"
          }`}
        >
          {trend === "down" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <div className="text-3xl font-mono font-bold text-white">
        {value}
        {unit && <span className="text-sm text-slate-500 ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-slate-500 mt-1 font-mono">{label}</div>
    </motion.div>
  );
}
