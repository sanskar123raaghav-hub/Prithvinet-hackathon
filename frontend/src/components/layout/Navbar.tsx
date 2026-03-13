"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Menu,
  X,
  Shield,
  BarChart3,
  Map,
  Bell,
  Globe,
  Factory,
  Brain,
  MessageSquare,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/map", label: "Pollution Map", icon: Map },
  { href: "/forecasting", label: "AI Forecasting", icon: Activity },
  { href: "/forecast", label: "Forecast", icon: Brain },
  { href: "/compliance", label: "Compliance", icon: Shield },
  { href: "/industries", label: "Industries", icon: Factory },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/copilot", label: "Copilot", icon: MessageSquare },
  { href: "/transparency", label: "Public Portal", icon: Globe },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 group-hover:bg-accent-cyan/20 transition-colors">
              <Activity className="h-5 w-5 text-accent-cyan" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-lg font-bold tracking-wider text-white">
                PRITHVINET
              </span>
              <span className="hidden sm:block text-[10px] font-mono text-slate-500 -mt-1 tracking-widest uppercase">
                Environmental Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-accent-cyan rounded-lg hover:bg-white/5 transition-all font-mono"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-mono rounded-lg border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-all"
            >
              Sign In
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-navy-900/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-slate-400 hover:text-accent-cyan rounded-lg hover:bg-white/5 transition-all font-mono"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center mt-3 px-4 py-2.5 text-sm font-mono rounded-lg border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
