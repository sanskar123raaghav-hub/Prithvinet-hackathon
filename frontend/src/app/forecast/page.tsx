"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Minimize2,
  Maximize2,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import { PollutionAreaChart } from "@/components/charts";

interface Forecast {
  region: string;
  metric: string;
  predictions: { hour: number; value: number }[];
}

interface ForecastResponse {
  generatedAt: string;
  forecasts: Forecast[];
}

interface ForecastStats {
  peak: number;
  lowest: number;
  trend: 'Rising' | 'Stable' | 'Decreasing';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function calculateStats(predictions: { hour: number; value: number }[]): ForecastStats {
  const values = predictions.map(p => p.value);
  const peak = Math.max(...values);
  const lowest = Math.min(...values);
  
  const first = values[0];
  const last = values[values.length - 1];
  let trend: 'Rising' | 'Stable' | 'Decreasing' = 'Stable';
  
  if (last > first + 5) trend = 'Rising';
  else if (last < first - 5) trend = 'Decreasing';
  
  return { peak, lowest, trend };
}

function RegionForecastCard({ forecast }: { forecast: Forecast }) {
  const chartData = useMemo(() => 
    forecast.predictions.map(p => ({
      hour: p.hour === 0 ? 'Now' : `${p.hour}h`,
      [`${forecast.metric.toLowerCase()}`]: p.value
    }))
  , [forecast]);
  
  const stats = calculateStats(forecast.predictions);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white font-mono">
            {forecast.region} Air Pollution Forecast
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1 font-mono uppercase tracking-wide">
            <span className="px-2 py-0.5 bg-accent-cyan/20 rounded text-accent-cyan text-xs">
              {forecast.metric}
            </span>
            <span>72 hours</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center p-4 bg-white/5 rounded-lg">
          <div className="text-2xl font-bold text-accent-orange">{stats.peak}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">Peak</div>
        </div>
        <div className="flex flex-col items-center p-4 bg-white/5 rounded-lg">
          <div className="text-2xl font-bold text-accent-green">{stats.lowest}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">Lowest</div>
        </div>
        <div className="flex flex-col items-center p-4 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-white capitalize">{stats.trend}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">Trend</div>
        </div>
      </div>

      {/* Chart */}
      <div className="text-xs font-mono text-slate-500 mb-4 flex items-center gap-4 uppercase tracking-wider">
        <span>Now • 24h • 48h • 72h</span>
        <span className="ml-auto">{forecast.metric} Index</span>
      </div>
      
      <PollutionAreaChart
        data={chartData}
        xKey="hour"
        yKey={`${forecast.metric.toLowerCase()}`}
        color="#00ff88"
        height={300}
      />
    </motion.div>
  );
}

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/forecast`)
      .then(res => {
        console.log('Forecast API response status:', res.status);
        if (!res.ok) {
          return res.text().then(text => {
            console.error('API error response:', text);
            throw new Error(`HTTP ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then((data: ForecastResponse) => {
        console.log('Raw forecast data:', data);
        setForecastData(data);
      })
      .catch(err => {
        console.error('Forecast fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const aqiForecasts = useMemo(() => 
    forecastData?.forecasts.filter(f => f.metric === 'AQI') || []
  , [forecastData]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-accent-cyan animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-mono">Generating multi-region forecasts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-red-400 font-mono text-lg">
        Forecast unavailable: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-cyan to-accent-green bg-clip-text text-transparent font-mono mb-4">
            Multi-Region Pollution Forecast
          </h1>
          <p className="text-xl text-slate-400 font-mono">
            AQI predictions for major cities • Generated: {forecastData?.generatedAt.slice(0,16).replace('T',' ')}
          </p>
        </motion.div>

        {/* Forecasts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {aqiForecasts.map((forecast, index) => (
            <motion.div
              key={`${forecast.region}-${forecast.metric}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RegionForecastCard forecast={forecast} />
            </motion.div>
          ))}
        </div>

        {aqiForecasts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-24 text-slate-500"
          >
            <p className="text-2xl font-mono mb-4">No forecast data available</p>
            <p className="text-lg">Check backend service status</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

