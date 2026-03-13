"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Database, Zap } from "lucide-react";

const stats = [
  { label: "Active Sensors", value: "2,847", icon: Zap },
  { label: "Data Points/Day", value: "14.2M", icon: Database },
  { label: "Cities Monitored", value: "156", icon: Database },
  { label: "Uptime", value: "99.97%", icon: Zap },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid animate-grid-fade" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.08)_0%,_transparent_70%)]" />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent-cyan/5 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-green/5 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 mb-8"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-mono text-accent-cyan tracking-wider">
            LIVE MONITORING ACTIVE — 2,847 SENSORS ONLINE
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          <span className="text-white">From Invisible Pollution</span>
          <br />
          <span className="text-gradient">to Visible Intelligence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed"
        >
          AI-powered environmental monitoring and forecasting platform.
          Track air, water, and noise pollution in real-time across cities.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-lg bg-accent-cyan text-navy-900 font-mono font-semibold text-sm hover:bg-accent-cyan/90 transition-all glow-cyan"
          >
            View Dashboard
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/transparency"
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg border border-white/10 text-slate-300 font-mono text-sm hover:bg-white/5 hover:border-white/20 transition-all"
          >
            Explore Environmental Data
          </Link>
        </motion.div>

        {/* Live stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="flex flex-col items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            >
              <span className="text-2xl font-mono font-bold text-white">
                {stat.value}
              </span>
              <span className="text-xs font-mono text-slate-500 mt-1">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-slate-600"
          >
            <span className="text-xs font-mono tracking-widest">SCROLL</span>
            <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
