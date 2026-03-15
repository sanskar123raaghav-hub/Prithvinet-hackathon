"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, Wifi, Database, Clock } from "lucide-react";
import { useLatestSensors, useAlerts } from "@/lib/hooks";
import { useState, useEffect } from "react";

export default function MonitorDashboard() {
  const { data: sensorData } = useLatestSensors();
  const { data: alertData } = useAlerts();
  
  const sensors = sensorData?.sensors || [];
  const alerts = alertData?.alerts || [];
  
  const [liveStats, setLiveStats] = useState({
    activeSensors: 0,
    highPriorityAlerts: 0,
    avgResponseTime: '2.4s'
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats({
        activeSensors: Math.floor(Math.random() * 10) + 25,
        highPriorityAlerts: Math.floor(Math.random() * 3) + 1,
        avgResponseTime: (Math.random() * 1 + 1.5).toFixed(1) + 's'
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 relative">
              <Activity className="h-6 w-6 text-yellow-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-mono">Monitoring Dashboard</h1>
              <p className="text-slate-400 font-mono">Live sensor monitoring and alert management</p>
            </div>
          </div>
        </motion.div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 animate-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Wifi className="h-6 w-6 text-yellow-400 animate-pulse" />
                <span className="text-xs font-mono uppercase text-yellow-400 tracking-wider">LIVE</span>
              </div>
              <div className="text-4xl font-mono font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                {liveStats.activeSensors}
              </div>
              <div className="text-sm font-mono text-slate-400 mb-1">Active Sensors</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-4xl font-mono font-bold text-red-400 mb-2">
              {liveStats.highPriorityAlerts}
            </div>
            <div className="text-sm font-mono text-slate-400 mb-1">High Priority Alerts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-accent-cyan" />
            </div>
            <div className="text-4xl font-mono font-bold text-accent-cyan mb-2">
              {liveStats.avgResponseTime}
            </div>
            <div className="text-sm font-mono text-slate-400">Avg Response</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Sensor Readings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-800 to-slate-900"
          >
            <h3 className="text-lg font-bold text-white mb-8 font-mono flex items-center gap-3">
              <Database className="h-5 w-5" />
              Live Sensor Readings
            </h3>
            <div className="space-y-4">
              {sensors.slice(0, 6).map((sensor) => (
                <div key={sensor.id} className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-cyan to-accent-green animate-pulse" />
                    <div className="font-mono text-sm text-slate-200 font-medium truncate flex-1">
                      {sensor.location}
                    </div>
                    <span className="text-xs px-2 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full font-mono">
                      {sensor.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 font-mono">
                    <div>AQI: <span className="text-white font-bold">{sensor.lastReading?.aqi || 'N/A'}</span></div>
                    <div>PM2.5: <span className="text-white font-bold">{sensor.lastReading?.pm25 || 'N/A'}</span></div>
                    <div className="col-span-2 text-[11px]">Status: <span className={`ml-1 px-2 py-0.5 rounded text-xs font-mono ${sensor.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {sensor.status}
                    </span></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Alerts */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-8 font-mono flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Active Alerts ({alerts.length})
            </h3>
            <div className="space-y-4">
              {alerts.filter(a => !a.acknowledged).slice(0, 8).map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 animate-pulse">
                  <div className={`h-4 w-4 rounded-full ${alert.severity === 'critical' ? 'bg-red-400' : 'bg-orange-400'}`} />
                  <div className="flex-1">
                    <div className="font-mono text-sm text-white truncate">{alert.message}</div>
                    <div className="text-xs text-slate-400 font-mono">{alert.location}</div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 text-xs font-mono text-orange-400 rounded-full">
                    ACK
                  </span>
                </div>
              ))}
              {alerts.filter(a => !a.acknowledged).length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <AlertTriangle className="h-16 w-16 mx-auto text-slate-600 mb-4 opacity-50" />
                  <div className="font-mono text-lg">All Clear</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

