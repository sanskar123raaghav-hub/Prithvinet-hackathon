import { Layers } from "lucide-react";

const legendItems = [
  { label: "Good (0-50)", color: "#00ff88" },
  { label: "Moderate (51-100)", color: "#00e5ff" },
  { label: "Poor (101-150)", color: "#ffbb33" },
  { label: "Hazardous (150+)", color: "#ff4444" },
];

export default function MapLegend() {
  return (
    <div className="flex items-center gap-6 mt-4 text-xs font-mono text-slate-500">
      <Layers className="h-4 w-4" />
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
