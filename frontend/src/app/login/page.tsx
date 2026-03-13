"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend JWT auth
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 bg-grid animate-grid-fade" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.06)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
              <Activity className="h-5 w-5 text-accent-cyan" />
            </div>
            <div>
              <span className="font-mono text-lg font-bold tracking-wider text-white">
                PRITHVINET
              </span>
              <span className="block text-[10px] font-mono text-slate-500 -mt-1 tracking-widest">
                SECURE ACCESS
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Access the environmental monitoring dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@prithvinet.gov"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan/30 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan/30 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-cyan text-navy-900 font-mono font-semibold text-sm hover:bg-accent-cyan/90 transition-all glow-cyan"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-600 font-mono">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-slate-500 hover:text-accent-cyan font-mono transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
