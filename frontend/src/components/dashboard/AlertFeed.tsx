"use client";

import { CheckCircle2 } from "lucide-react";

interface Alert {
  id: number;
  type: string;
  message: string;
  time: string;
  severity: "high" | "medium" | "low";
}

interface AlertFeedProps {
  alerts: Alert[];
}

export default function AlertFeed({ alerts }: AlertFeedProps) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
        >
          <div
            className={`h-2 w-2 rounded-full ${
              alert.severity === "high" ? "bg-red-400" : alert.severity === "medium" ? "bg-yellow-400" : "bg-accent-cyan"
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-cyan">{alert.type}</span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-500 font-mono">{alert.time}</span>
            </div>
            <p className="text-sm text-slate-300 truncate">{alert.message}</p>
          </div>
          <CheckCircle2 className="h-4 w-4 text-slate-600 flex-shrink-0 cursor-pointer hover:text-accent-green transition-colors" />
        </div>
      ))}
    </div>
  );
}
