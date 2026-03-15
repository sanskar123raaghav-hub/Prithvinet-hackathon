'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Fix for SSR leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored marker icons
const getMarkerIcon = (aqi: number) => {
  const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444']; // green, yellow, orange, red
  const size = aqi > 200 ? 32 : aqi > 100 ? 28 : 24;
  const color = aqi < 50 ? colors[0] : aqi < 100 ? colors[1] : aqi < 200 ? colors[2] : colors[3];
  
  return L.divIcon({
    html: `&nbsp;<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid rgba(255,255,255,0.8);box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    className: 'marker-custom',
    iconAnchor: [size/2, size/2]
  });
};

// Station interface
interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  co2: number;
  noise: number;
  temp: number;
  humidity: number;
  lastUpdated: string;
}

// Generate 8 stations around Raipur
const initialStations: Station[] = [
  { id: 'S1', name: 'Raipur Central', lat: 21.2514, lng: 81.6296, aqi: 85, pm25: 45, co2: 420, noise: 68, temp: 32.5, humidity: 72, lastUpdated: new Date().toISOString() },
  { id: 'S2', name: 'Telibandha', lat: 21.241, lng: 81.642, aqi: 142, pm25: 78, co2: 480, noise: 82, temp: 33.1, humidity: 68, lastUpdated: new Date().toISOString() },
  { id: 'S3', name: 'Pandesara', lat: 21.265, lng: 81.610, aqi: 210, pm25: 95, co2: 520, noise: 75, temp: 31.8, humidity: 78, lastUpdated: new Date().toISOString() },
  { id: 'S4', name: 'Mowa', lat: 21.235, lng: 81.615, aqi: 65, pm25: 32, co2: 405, noise: 62, temp: 32.9, humidity: 75, lastUpdated: new Date().toISOString() },
  { id: 'S5', name: 'Kalibadi', lat: 21.260, lng: 81.645, aqi: 175, pm25: 88, co2: 495, noise: 79, temp: 33.4, humidity: 70, lastUpdated: new Date().toISOString() },
  { id: 'S6', name: 'Devendra Nagar', lat: 21.245, lng: 81.605, aqi: 38, pm25: 22, co2: 410, noise: 55, temp: 32.2, humidity: 80, lastUpdated: new Date().toISOString() },
  { id: 'S7', name: 'Supela', lat: 21.255, lng: 81.655, aqi: 198, pm25: 92, co2: 510, noise: 84, temp: 33.0, humidity: 69, lastUpdated: new Date().toISOString() },
  { id: 'S8', name: 'Bhatagaon', lat: 21.270, lng: 81.620, aqi: 112, pm25: 58, co2: 455, noise: 71, temp: 32.7, humidity: 74, lastUpdated: new Date().toISOString() },
];

export default function PollutionMapPage() {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [heatmapLayer, setHeatmapLayer] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Update data every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(station => ({
        ...station,
        aqi: Math.max(20, Math.floor(Math.random() * 250)),
        pm25: (Math.random() * 100).toFixed(1) as any as number,
        co2: Math.floor(380 + Math.random() * 200),
        noise: Math.floor(45 + Math.random() * 50),
        temp: +(25 + Math.random() * 12).toFixed(1) as any as number,
        humidity: Math.floor(50 + Math.random() * 40),
        lastUpdated: new Date().toISOString()
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update heatmap when stations change
  const updateHeatmap = useCallback(() => {
    if (mapRef.current && window.L.heatLayer) {
      if (heatmapLayer) {
        mapRef.current.removeLayer(heatmapLayer);
      }
      const heatData = stations.map(s => [s.lat, s.lng, s.pm25 / 100]);
      const newHeatLayer = window.L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: 'blue', 0.65: 'lime', 0.8: 'yellow', 1: 'red' }
      });
      newHeatLayer.addTo(mapRef.current);
      setHeatmapLayer(newHeatLayer);
    }
  }, [stations, heatmapLayer]);

  useEffect(() => {
    updateHeatmap();
  }, [stations, updateHeatmap]);


  const MapEventHandler = () => {
    const map = useMap();
    mapRef.current
