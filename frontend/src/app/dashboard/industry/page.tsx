"use client";

import { motion } from "framer-motion";
import { Factory, TrendingUp, ShieldCheck, BarChart3, AlertCircle } from "lucide-react";
import { useIndustries } from "@/lib/hooks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function IndustryDashboard() {
  const { data: industryData } = useIndustries();
  
  const industries = industryData?.industries || [];
  
  // Compliance chart data
  const complianceData = [
    { name: 'Compliant', value: industries.filter(i => i.status === 'Compliant').length, fill: '#10b981' },
    { name: 'Warning', value: industries.filter(i => i.status === 'Warning').length, fill: '#f59e0b' },
    { name: 'Non-Compliant', value: industries.filter(i => i.status === 'Non-Compliant').length, fill: '#ef4444' },
  ];

  const topEmitters = industries
    .filter(i => i.emissionLevel != null)
    .sort((a, b) => (b.emissionLevel || 0) - (a.emissionLevel || 0))
    .slice(0, 5);

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
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Factory className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-mono">Industry Compliance Dashboard</h1>
              <p className="text-slate-400 font-mono">Emission monitoring and regulatory compliance</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Compliance Overview */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Compliance Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Emission Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-orange-500/5 to-red-500/5"
          >
            <h3 className="text-lg font-bold text-white mb-6 font-mono">Current Emissions</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-slate-400">Avg Emission Level</span>
                  <span className="font-mono text-2xl font-bold text-orange-400">
                    {industries.reduce((sum, i) => sum + (i.emissionLevel || 0), 0) / industries.length | 0 || 0} µg/m³
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Compliant</span>
                  <span className="font-mono font-bold text-green-400">
                    {complianceData[0].value}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Warning</span>
                  <span className="font-mono font-bold text-yellow-400">
                    {complianceData[1].value}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Violations</span>
                  <span className="font-mono font-bold text-red-400">
                    {complianceData[2].value}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Emitters & Compliance Table */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-lg font-bold text-white mb-8 font-mono">Top 5 Emitters</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-mono text-slate-400 font-medium">Industry</th>
                  <th className="text-left py-4 px-6 text-sm font-mono text-slate-400 font-medium">Location</th>
                  <th className="text-right py-4 px-6 text-sm font-mono text-slate-400 font-medium">Emission Level</th>
                  <th className="text-right py-4 px-6 text-sm font-mono text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {topEmitters.map((industry, idx) => (
                  <tr key={industry.id} className={`hover:bg-white/5 transition-colors ${idx === 0 ? 'border-t border-white/10' : ''}`}>
                    <td className="py-4 px-6 font-mono text-sm text-white font-medium truncate max-w-[200px]">
                      {industry.name}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono truncate">
                      {industry.location}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-orange-400 font-bold text-right">
                      {industry.emissionLevel} µg/m³
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                        industry.status === 'Compliant' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        industry.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      } border`}>
                        {industry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

