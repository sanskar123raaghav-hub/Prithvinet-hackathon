import { Activity, Github, ExternalLink } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pollution Map", href: "/map" },
    { label: "AI Forecasting", href: "/forecasting" },
    { label: "Compliance", href: "/compliance" },
  ],
  Resources: [
    { label: "API Documentation", href: "#" },
    { label: "Data Standards", href: "#" },
    { label: "Open Data Portal", href: "/transparency" },
    { label: "Research Papers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Data Governance", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                <Activity className="h-4 w-4 text-accent-cyan" />
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                PRITHVINET
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-Driven Environmental Intelligence Platform. Monitoring air, water, and noise pollution for a sustainable future.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-accent-green font-mono">
                <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-accent-cyan transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
            <span>&copy; {new Date().getFullYear()} PRITHVINET</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Environmental Intelligence Division</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
