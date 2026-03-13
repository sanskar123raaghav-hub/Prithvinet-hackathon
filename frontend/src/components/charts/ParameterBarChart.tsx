"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  [key: string]: string | number;
}

interface ParameterBarChartProps {
  data: DataPoint[];
  xKey: string;
  bars: { dataKey: string; color: string }[];
  height?: number;
}

const tooltipStyle = {
  backgroundColor: "#0d1529",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};

export default function ParameterBarChart({
  data,
  xKey,
  bars,
  height = 250,
}: ParameterBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey={xKey} stroke="#475569" fontSize={11} fontFamily="monospace" />
        <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
        <Tooltip contentStyle={tooltipStyle} />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
