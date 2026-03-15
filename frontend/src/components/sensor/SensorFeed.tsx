import { SensorStation } from '@/lib/sensorSimulation';
import { Wind, Thermometer, Droplets, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorFeedProps {
  sensors: SensorStation[];
}

const getAQIColor = (aqi: number): string => {
  if (aqi < 50) return 'bg-green-500';
  if (aqi < 100) return 'bg-yellow-500';
  if (aqi < 200) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function SensorFeed({ sensors }: SensorFeedProps) {
  const getAQIClass = (aqi: number) => {
    if (aqi < 50) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (aqi < 100) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (aqi < 200) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm"
        >
          <div className="text-sm text-slate-400 font-mono mb-1">Active Sensors</div>
          <div className="text-2xl font-bold text-white">{sensors.length}</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border border-white/5 bg-gradient-to-r bg-white/5 from-accent-cyan/10 backdrop-blur-sm"
        >
          <div className="text-sm text-slate-400 font-mono mb-1">Highest AQI</div>
          <div className="text-2xl font-bold text-accent-cyan">
            {Math.max(...sensors.map(s => s.AQI))}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm"
        >
          <div className="text-sm text-slate-400 font-mono mb-1">Avg AQI</div>
          <div className="text-2xl font-bold text-white">
            {Math.round(sensors.reduce((sum, s) => sum + s.AQI, 0) / sensors.length)}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-white/5 bg-gradient-to-r bg-white/5 from-yellow-400/10 backdrop-blur-sm"
        >
          <div className="text-sm text-slate-400 font-mono mb-1">Max PM2.5</div>
          <div className="text-2xl font-bold text-yellow-400">
            {Math.max(...sensors.map(s => s.PM25)).toFixed(1)} µg/m³
          </div>
        </motion.div>
      </div>

      {/* Sensor Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Wind className="h-5 w-5 text-accent-cyan" />
            Sensor Network Status (Live)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Real-time IoT sensor data • Updates every 5s</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Station</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider">AQI</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider hidden md:table-cell">PM2.5</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider hidden lg:table-cell">CO2</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider hidden xl:table-cell">Noise</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider hidden 2xl:table-cell">Temp</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider hidden 2xl:table-cell">Humidity</th>
                <th className="px-6 py-4 text-right text-xs font-mono text-slate-400 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sensors.map((sensor, index) => (
                <motion.tr 
                  key={sensor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-white/5 transition-colors group ${getAQIColor(sensor.AQI)}/5`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-3 shadow-lg ${getAQIColor(sensor.AQI)}`}></div>
                      <div>
                        <div className="font-mono text-sm text-white font-medium group-hover:text-accent-cyan transition-colors">{sensor.name}</div>
                        <div className="text-xs text-slate-500">{sensor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-mono font-bold ${getAQIClass(sensor.AQI)}`}>
                      {sensor.AQI}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white hidden md:table-cell">
                    {sensor.PM25} µg/m³
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 hidden lg:table-cell">
                    {sensor.CO2} ppm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 hidden xl:table-cell">
                    {sensor.Noise} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 hidden 2xl:table-cell">
                    {sensor.Temperature}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300 hidden 2xl:table-cell">
                    {sensor.Humidity}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-xs font-mono text-slate-500">
                      {formatTimeAgo(sensor.lastUpdated)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

