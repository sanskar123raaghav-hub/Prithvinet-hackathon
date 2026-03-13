"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export interface MapSensor {
  id: number | string;
  lat: number;
  lng: number;
  name: string;
  aqi: number;
  type: string;
}

interface PollutionMapProps {
  sensors: MapSensor[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

function getColor(aqi: number) {
  if (aqi <= 50) return "#00ff88";
  if (aqi <= 100) return "#00e5ff";
  if (aqi <= 150) return "#ffbb33";
  return "#ff4444";
}

export default function PollutionMap({
  sensors,
  center = [22.5, 78.9],
  zoom = 5,
  height = "600px",
}: PollutionMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="rounded-xl border border-white/5 bg-navy-800 flex items-center justify-center"
      >
        <span className="text-sm font-mono text-slate-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#0a0f1e" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {sensors.map((sensor) => (
          <CircleMarker
            key={sensor.id}
            center={[sensor.lat, sensor.lng]}
            radius={12}
            fillColor={getColor(sensor.aqi)}
            color={getColor(sensor.aqi)}
            weight={2}
            opacity={0.8}
            fillOpacity={0.4}
          >
            <Popup>
              <div className="font-mono text-xs">
                <strong>{sensor.name}</strong>
                <br />
                AQI: {sensor.aqi} | Type: {sensor.type}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
