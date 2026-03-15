import { Activity } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b3d91]">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[#0b3d91] tracking-wide uppercase">
                PRITHVINET
              </span>
            </div>
            <p className="text-xs font-semibold text-[#0b3d91] mb-1">
              Government of Chhattisgarh
            </p>
            <p className="text-xs text-gray-500 mb-1">
              Department of Environment and Climate Change
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              PRITHVINET Environmental Monitoring System — Real-time tracking of
              air, water, and noise pollution across Chhattisgarh.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-700 font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Links
            </div>
            <ul className="space-y-1.5">
              {[
                { href: "/dashboard",    label: "Dashboard"     },
                { href: "/map",          label: "Pollution Map" },
                { href: "/forecast",     label: "Forecast"      },
                { href: "/alerts",       label: "Alerts"        },
                { href: "/copilot",      label: "AI Copilot"    },
                { href: "/transparency", label: "Public Portal" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-gray-500 hover:text-[#0b3d91] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Disclaimer
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Data on this portal is sourced from real-time environmental sensors
              deployed across Chhattisgarh. For official regulatory purposes,
              refer to CPCB and SPCB certified reports.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © 2026 Government of Chhattisgarh. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              PRITHVINET · Environmental Monitoring System · v2.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}