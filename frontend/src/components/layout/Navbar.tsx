"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
  { href: "/dashboard",    label: "Dashboard",      icon: BarChart3     },
  { href: "/map",          label: "Pollution Map",  icon: Map           },
  { href: "/forecasting",  label: "AI Forecasting", icon: Activity      },
  { href: "/forecast",     label: "Forecast",       icon: Brain         },
  { href: "/compliance",   label: "Compliance",     icon: Shield        },
  { href: "/industries",   label: "Industries",     icon: Factory       },
  { href: "/alerts",       label: "Alerts",         icon: Bell          },
  { href: "/copilot",      label: "Copilot",        icon: MessageSquare },
  { href: "/transparency", label: "Public Portal",  icon: Globe         },
];

const roleAccess: Record<string, string[]> = {
  citizen:  ["/dashboard", "/map", "/forecast", "/alerts", "/copilot", "/transparency"],
  industry: ["/dashboard", "/industries", "/alerts", "/forecast", "/copilot"],
  monitor:  ["/dashboard", "/map", "/alerts", "/forecast"],
  regional: ["/dashboard", "/map", "/industries", "/compliance", "/alerts", "/forecast", "/copilot"],
  admin:    navLinks.map(l => l.href),
};

export default function Navbar() {
  const pathname                          = usePathname();
  const [mobileOpen,   setMobileOpen  ]  = useState(false);
  const [role,         setRole        ]  = useState("citizen");
  const [roleDropdown, setRoleDropdown]  = useState(false);

  const visibleLinks = navLinks.filter(l => roleAccess[role].includes(l.href));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">

      {/* Govt colour stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0b3d91] via-[#1a56b0] to-[#2a9d8f]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Branding */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative h-11 w-11 flex-shrink-0">
              <Image
                src="/chhattisgarh-logo.png"
                alt="Government of Chhattisgarh"
                fill
                className="object-contain"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = "none";
                  const p = t.parentElement;
                  if (p) p.innerHTML = `<div style="width:44px;height:44px;border-radius:50%;background:#0b3d91;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;font-family:sans-serif;">CG</div>`;
                }}
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-[#0b3d91] tracking-wide">
                Government of Chhattisgarh
              </div>
              <div className="text-[11px] text-gray-500 font-medium">
                Environmental Monitoring Portal
              </div>
            </div>
          </Link>

          {/* Role Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setRoleDropdown(!roleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:border-[#0b3d91] hover:text-[#0b3d91] transition-all bg-white"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Role</span>
              <span className="capitalize">{role.replace("_", " ")}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform text-gray-400 ${roleDropdown ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {roleDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                >
                  {[
                    { key: "citizen",  label: "Citizen"         },
                    { key: "industry", label: "Industry User"    },
                    { key: "monitor",  label: "Monitoring Team"  },
                    { key: "regional", label: "Regional Officer" },
                    { key: "admin",    label: "Super Admin"      },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setRole(key); setRoleDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        role === key
                          ? "bg-[#e6f0ff] text-[#0b3d91] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {role === key && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0b3d91] flex-shrink-0" />
                      )}
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {visibleLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    active
                      ? "text-[#0b3d91] bg-[#e6f0ff] font-semibold"
                      : "text-gray-600 hover:text-[#0b3d91] hover:bg-[#e6f0ff]"
                  }`}
                >
                  <link.icon className={`h-3.5 w-3.5 ${active ? "text-[#0b3d91]" : "text-gray-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-[#0b3d91] text-white hover:bg-[#0a3278] transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-[#0b3d91] hover:bg-[#e6f0ff] transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-3 space-y-0.5">
              {visibleLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                      active
                        ? "text-[#0b3d91] bg-[#e6f0ff] font-semibold border-l-4 border-[#0b3d91]"
                        : "text-gray-600 hover:text-[#0b3d91] hover:bg-[#e6f0ff]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 flex-shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center mt-2 px-4 py-2.5 text-sm font-medium rounded-md bg-[#0b3d91] text-white hover:bg-[#0a3278] transition-colors"
              >
                Sign In
              </Link>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400 text-center">
                Government of Chhattisgarh · PRITHVINET Environmental Monitoring Portal
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}