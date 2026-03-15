"use client";

import { motion } from "framer-motion";
import { Map, Wind, AlertTriangle, Sun, Droplets } from "lucide-react";
import { useLatestSensors, useAlerts } from "@/lib/hooks";
import dynamic from 'next/dynamic';

const PollutionMap = dynamic(() => import('@/components/maps/PollutionMap'), { ssr: false });

export default function CitizenDashboard() {
  const { data: sensorData } = useLatestSensors();
  const { data: alertData } = useAlerts();
  
  const sensors = sensorData?.sensors || [];
  const alerts = alertData?.alerts || [];
  
  const currentAQI = sensors.reduce((sum, s) => sum + (s.lastReading?.aqi || 0), 0) / sensors.length || 0;

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
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Globe className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-mono">Citizen Dashboard</h1>
              <p className="text-slate-400 font-mono">Public environmental data and health alerts</p>
            </div>
          </div>
        </motion.div>

        {/* AQI Hero */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12 p-12 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-violet-500/5 backdrop-blur-xl"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 rounded-2xl mb-8">
            <Wind className="h-8 w-8 text-purple-400" />
            <div>
              <div className="text-5xl font-mono font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {Math.round(currentAQI)}
              </div>
              <div className="text-sm font-mono text-slate-400 uppercase tracking-wider">AQI Index</div>
            </div>
          </div>
          <div className="text-lg text-slate-300 font-mono">
            Air Quality: {currentAQI < 50 ? 'Good' : currentAQI < 100 ? 'Moderate' : currentAQI < 200 ? 'Unhealthy' : 'Hazardous'}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Public Pollution Map */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h3 className="font-mono text-lg font-bold text-white flex items-center gap-3">
                <Map className="h-5 w-5" />
                Live Pollution Map
              </h3>
            </div>
            <div className="h-96">
              <PollutionMap />
            </div>
          </motion.div>

          {/* Health Guidelines */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-indigo-500/5 to-purple-500/5">
              <h3 className="text-lg font-bold text-white mb-6 font-mono flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Health Guidelines
              </h3>
              <div className="space-y-4 text-sm">
                <div className={`p-3 rounded-xl border ${currentAQI < 100 ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
                  <div className="font-mono text-white font-medium">Mask Recommendation</div>
                  <div className="text-slate-300">Wear mask if AQI > 100 or you have respiratory conditions</div>
                </div>
                <div className="p-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5">
                  <div className="font-mono text-accent-cyan font-medium">Outdoor Activity</div>
                  <div className="text-slate-300">Limit outdoor exercise when AQI > 150</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="text-center p-4">
                <div className="text-2xl font-mono font-bold text-purple-400">{sensors.length}</div>
                <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Sensors Online</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-mono font-bold text-indigo-400">{alerts.filter(a => !a.acknowledged).length}</div>
                <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Active Alerts</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Public Alerts Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-lg font-bold text-white mb-8 font-mono flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Public Health Alerts ({alerts.filter(a => !a.acknowledged).length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.filter(a => !a.acknowledged).slice(0, 6).map((alert) => (
              <div key={alert.id} className="p-6 rounded-xl border border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-red-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-3 w-3 rounded-full animate-pulse ${alert.severity === 'critical' ? 'bg-red-400' : 'bg-orange-400'}`} />
                  <span className="font-mono text-sm text-slate-300 uppercase tracking-wider">{alert.type}</span>
                </div>
                <div className="font-mono text-lg text-white mb-2 line-clamp-2">{alert.message}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <MapPin className="h-3 w-3" />
                  {alert.location}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

