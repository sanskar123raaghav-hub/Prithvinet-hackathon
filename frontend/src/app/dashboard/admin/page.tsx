"use client";

import { motion } from "framer-motion";
import { Shield, BarChart3, AlertTriangle, Activity, Database } from "lucide-react";
import { useLatestSensors, useAlerts, useIndustries } from "@/lib/hooks";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { data: sensorData } = useLatestSensors();
  const { data: alertData } = useAlerts();
  const { data: industryData } = useIndustries();
  
  const sensors = sensorData?.sensors || [];
  const alerts = alertData?.alerts || [];
  const industries = industryData?.industries || [];

  const stats = [
    {
      title: "Total Sensors",
      value: sensors.length,
      change: "+2 today",
      icon: Database,
      color: "text-accent-cyan",
    },
    {
      title: "Active Industries",
      value: industries.length,
      change: "+1 this week",
      icon: Shield,
      color: "text-accent-green",
    },
    {
      title: "Active Alerts",
      value: alerts.filter(a => !a.acknowledged).length,
      change: "+5 today",
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      title: "Compliance Rate",
      value: "87%",
      change: "+2.3%",
      icon: BarChart3,
      color: "text-yellow-400",
    },
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
            <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
              <Shield className="h-6 w-6 text-accent-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-mono">Admin Dashboard</h1>
              <p className="text-slate-400 font-mono">System-wide environmental intelligence overview</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-accent-cyan/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-accent-cyan/10 transition-colors w-fit ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-mono text-slate-400">{stat.title}</div>
                <div className={`text-sm font-mono mt-1 ${stat.color}`}>
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Sensor Overview */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Sensor Network Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sensors.slice(0, 8).map((sensor, idx) => (
                <div key={sensor.id} className="p-4 rounded-lg bg-white/5">
                  <div className="text-xs text-slate-500 font-mono mb-1 truncate">{sensor.location}</div>
                  <div className="text-sm font-mono text-white">{sensor.lastReading?.aqi || 'N/A'}</div>
                  <div className="text-xs text-slate-400">AQI</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Compliance Overview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-accent-cyan/5 to-accent-green/5"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Compliance Snapshot</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono text-sm">Compliant</span>
                <span className="font-mono font-bold text-accent-green">67%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono text-sm">Warning</span>
                <span className="font-mono font-bold text-yellow-400">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono text-sm">Non-Compliant</span>
                <span className="font-mono font-bold text-red-400">10%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-lg font-bold text-white mb-6 font-mono flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Recent Alerts ({alerts.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className={`h-3 w-3 rounded-full ${alert.severity === 'critical' ? 'bg-red-400' : alert.severity === 'warning' ? 'bg-yellow-400' : 'bg-accent-cyan'} animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-white truncate">{alert.message}</div>
                  <div className="text-xs text-slate-400 font-mono">{alert.location}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-mono ${alert.severity === 'critical' ? 'bg-red-400/10 text-red-400' : alert.severity === 'warning' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-accent-cyan/10 text-accent-cyan'}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono">
                No active alerts
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

