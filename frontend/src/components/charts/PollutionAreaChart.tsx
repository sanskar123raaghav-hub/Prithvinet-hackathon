"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  [key: string]: string | number | null;
}

interface PollutionAreaChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  gradientId?: string;
}

const tooltipStyle = {
  backgroundColor: "#0d1529",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};

export default function PollutionAreaChart({
  data,
  xKey,
  yKey,
  color = "#00e5ff",
  height = 250,
  gradientId = "chartGrad",
}: PollutionAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey={xKey} stroke="#475569" fontSize={11} fontFamily="monospace" />
        <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
