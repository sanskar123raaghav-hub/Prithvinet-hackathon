"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, MapPin } from "lucide-react";

interface AlertCardProps {
  id: number;
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  location: string;
  time: string;
  acknowledged: boolean;
  onAcknowledge?: (id: number) => void;
  delay?: number;
}

const severityConfig = {
  critical: { dot: "bg-red-400", bg: "bg-red-400/5", border: "border-red-400/20" },
  warning: { dot: "bg-yellow-400", bg: "bg-yellow-400/5", border: "border-yellow-400/20" },
  info: { dot: "bg-accent-cyan", bg: "bg-accent-cyan/5", border: "border-accent-cyan/20" },
};

export default function AlertCard({
  id,
  type,
  severity,
  message,
  location,
  time,
  acknowledged,
  onAcknowledge,
  delay = 0,
}: AlertCardProps) {
  const sev = severityConfig[severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-xl border ${sev.border} ${acknowledged ? "bg-white/[0.01]" : sev.bg}`}
    >
      <div className="flex items-start gap-4">
        <div className={`h-3 w-3 rounded-full mt-1 ${sev.dot} ${!acknowledged ? "animate-pulse" : ""}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-accent-cyan">{type}</span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-500 uppercase">{severity}</span>
          </div>
          <p className="text-sm text-white mb-1">{message}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {time}
            </span>
          </div>
        </div>
        {acknowledged ? (
          <CheckCircle2 className="h-5 w-5 text-accent-green flex-shrink-0" />
        ) : (
          <button
            onClick={() => onAcknowledge?.(id)}
            className="px-3 py-1 text-xs font-mono rounded border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
          >
            Acknowledge
          </button>
        )}
      </div>
    </motion.div>
  );
}
