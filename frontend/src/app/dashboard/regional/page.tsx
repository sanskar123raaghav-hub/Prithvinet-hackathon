"use client";

import { motion } from "framer-motion";
import { MapPin, AlertTriangle, TrendingUp, BarChart3, Thermometer } from "lucide-react";
import { useLatestSensors, useAlerts, useForecast } from "@/lib/hooks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function RegionalDashboard() {
  const { data: sensorData } = useLatestSensors();
  const { data: alertData } = useAlerts();
  const { data: forecastData } = useForecast("air");

  const sensors = sensorData?.sensors || [];
  const alerts = alertData?.alerts || [];
  const regionalSensors = sensors.filter(s => s.location.includes("Delhi") || s.location.includes("Mumbai"));

  const chartData = [
    { name: 'Good', value: 45, color: '#10b981' },
    { name: 'Moderate', value: 30, color: '#f59e0b' },
    { name: 'Poor', value: 25, color: '#ef4444' },
  ];

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
            <div className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/20">
              <MapPin className="h-6 w-6 text-accent-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-mono">Regional Officer Dashboard</h1>
              <p className="text-slate-400 font-mono">Delhi-NCR Regional environmental monitoring</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Regional Sensors */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Regional Sensors ({regionalSensors.length})</h3>
            <div className="space-y-4">
              {regionalSensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
                    (sensor.lastReading?.aqi || 0) < 50 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    (sensor.lastReading?.aqi || 0) < 100 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    (sensor.lastReading?.aqi || 0) < 200 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  } border`}>
                    {(sensor.lastReading?.aqi || 0).toString()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-white truncate">{sensor.location}</div>
                    <div className="text-xs text-slate-400">{sensor.type.toUpperCase()}</div>
                  </div>
                  <span className="text-xs font-mono text-slate-500 px-3 py-1 bg-white/5 rounded-full">
                    {sensor.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Regional Alerts ({alerts.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.slice(0, 6).map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${alert.severity === 'critical' ? 'bg-red-400' : 'bg-orange-400'}`} />
                    <div className="flex-1">
                      <div className="font-mono text-sm text-white">{alert.message}</div>
                      <div className="text-xs text-slate-400 font-mono">{alert.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pollution Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Pollution Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Forecast Trend */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">24h AQI Forecast</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-mono text-sm font-bold text-white">
                  152
                </div>
                <div>
                  <div className="font-mono text-sm text-slate-400">Current</div>
                  <div className="text-lg font-bold text-white">152 AQI</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-mono">+12h</span>
                  <span className="font-mono font-bold text-orange-400">165</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-mono">+24h</span>
                  <span className="font-mono font-bold text-red-400">178</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

