"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  ShieldCheck,
  MapPin,
  BellRing,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Environmental Monitoring",
    description:
      "Continuous air, water, and noise pollution tracking from thousands of IoT sensors deployed across cities.",
    color: "cyan",
  },
  {
    icon: Brain,
    title: "AI Pollution Forecasting",
    description:
      "Machine learning models predict pollution trends 24–72 hours ahead, enabling proactive environmental management.",
    color: "green",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Tracking",
    description:
      "Automated monitoring of environmental regulations with instant violation detection and reporting workflows.",
    color: "blue",
  },
  {
    icon: MapPin,
    title: "Geospatial Pollution Maps",
    description:
      "Interactive heatmaps and spatial analysis showing pollution distribution patterns across monitored regions.",
    color: "cyan",
  },
  {
    icon: BellRing,
    title: "Smart Alerts",
    description:
      "Intelligent threshold-based alerting system with escalation paths and multi-channel notifications.",
    color: "green",
  },
  {
    icon: Users,
    title: "Citizen Transparency Portal",
    description:
      "Public-facing dashboards providing open access to environmental data, fostering community awareness.",
    color: "blue",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan: {
    bg: "bg-accent-cyan/10",
    border: "border-accent-cyan/20",
    text: "text-accent-cyan",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]",
  },
  green: {
    bg: "bg-accent-green/10",
    border: "border-accent-green/20",
    text: "text-accent-green",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,255,136,0.1)]",
  },
  blue: {
    bg: "bg-accent-blue/10",
    border: "border-accent-blue/20",
    text: "text-accent-blue",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
  },
};

export default function Features() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,229,255,0.04)_0%,_transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-xs font-mono tracking-widest text-accent-cyan border border-accent-cyan/20 rounded-full bg-accent-cyan/5 mb-4">
            PLATFORM CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Intelligence at Every Layer
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400">
            Comprehensive environmental monitoring powered by AI, delivering
            actionable insights from sensor to dashboard.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const colors = colorMap[feature.color];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-all duration-300 ${colors.glow}`}
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border mb-5`}
                >
                  <feature.icon className={`h-6 w-6 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
