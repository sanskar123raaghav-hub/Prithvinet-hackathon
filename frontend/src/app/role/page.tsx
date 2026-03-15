

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Shield, MapPin, Factory, Globe } from "lucide-react";

const roles = [
  {
    title: "Admin Dashboard",
    description: "System-wide environmental monitoring, alerts, and compliance overview",
    href: "/dashboard/admin",
    icon: Shield,
    color: "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20",
  },
  {
    title: "Regional Officer Dashboard",
    description: "Regional sensor data, localized alerts, and pollution trends",
    href: "/dashboard/regional",
    icon: MapPin,
    color: "text-accent-green bg-accent-green/10 border-accent-green/20",
  },
  {
    title: "Monitoring Team Dashboard", 
    description: "Live sensor readings, real-time alerts, and maintenance dashboard",
    href: "/dashboard/monitor",
    icon: Users,
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  {
    title: "Industry Dashboard",
    description: "Emission compliance, regulatory reports, and industry analytics",
    href: "/dashboard/industry",
    icon: Factory,
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  },
  {
    title: "Citizen Dashboard",
    description: "Public AQI, pollution maps, health alerts, and community reporting",
    href: "/dashboard/citizen",
    icon: Globe,
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
];

export default function RolePage() {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-navy-900 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 font-mono tracking-tight">
            PRITHVINET Role Dashboard
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-mono">
            Select your role to access specialized environmental monitoring and compliance dashboard
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <Link 
                href={role.href}
                className={`block p-8 rounded-2xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-cyan/10 h-full 
                ${role.color} border-opacity-30 bg-opacity-10 backdrop-blur-xl`}
              >
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 mb-6 w-fit ${role.color}`}>
                    <role.icon className="h-8 w-8" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-4 font-mono group-hover:text-opacity-100">
                      {role.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-8">
                      {role.description}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-1">
                      <div className={`h-2 w-2 rounded-full ${role.color.replace('text-', 'bg-').replace('border-', 'bg-')} opacity-60`} />
                      <div className={`h-2 w-2 rounded-full ${role.color.replace('text-', 'bg-').replace('border-', 'bg-')} opacity-80`} />
                      <div className={`h-2 w-2 rounded-full ${role.color}`} />
                    </div>
                    <div className="text-2xl font-mono text-slate-500 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

