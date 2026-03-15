"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "./api";

// ── Generic fetch hook ────────────────────────────────────────────────
function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ── Sensor types ──────────────────────────────────────────────────────
interface SensorReading {
  aqi?: number;
  pm25?: number;
  pm10?: number;
  ph?: number;
  dissolvedOxygen?: number;
  bod?: number;
  decibels?: number;
  peakDb?: number;
  timestamp?: string;
}

export interface Sensor {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  status: string;
  lastReading?: SensorReading;
}

interface SensorsResponse {
  count: number;
  sensors: Sensor[];
}

export function useSensors(type?: string) {
  return useFetch<SensorsResponse>(
    () => api.getSensors(type) as Promise<SensorsResponse>,
    [type]
  );
}

export function useLatestSensors() {
  return useFetch<SensorsResponse>(
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sensors`
      ).then((r) => r.json()) as Promise<SensorsResponse>,
    []
  );
}

// ── Alert types ───────────────────────────────────────────────────────
export interface Alert {
  id: number;
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: number | null;
}

interface AlertsResponse {
  count: number;
  alerts: Alert[];
}

export function useAlerts(severity?: string) {
  return useFetch<AlertsResponse>(
    () => api.getAlerts(severity) as Promise<AlertsResponse>,
    [severity]
  );
}

// ── Forecast types ────────────────────────────────────────────────────
export interface ForecastPrediction {
  timestamp: string;
  hour: string;
  predicted_aqi?: number;
  predicted_pm25?: number;
  predicted_ph?: number;
  predicted_do?: number;
  predicted_bod?: number;
  predicted_decibels?: number;
  confidence: number;
}

export interface ForecastResponse {
  type: string;
  model: string;
  algorithm: string;
  generatedAt: string;
  forecastHours: number;
  predictions: ForecastPrediction[];
  generated_at?: string;
  forecast_hours?: number;
}

export function useForecast(type: string, hours = 72) {
  return useFetch<ForecastResponse>(
    () => api.getForecast(type, hours) as Promise<ForecastResponse>,
    [type, hours]
  );
}

// ── Reports ───────────────────────────────────────────────────────────
export interface Report {
  id: number;
  title: string;
  date: string;
  type: string;
  size: string;
  category: string;
}

interface ReportsResponse {
  count: number;
  reports: Report[];
}

export function useReports() {
  return useFetch<ReportsResponse>(
    () => api.getReports() as Promise<ReportsResponse>,
    []
  );
}

// ── Industries ────────────────────────────────────────────────────────
export interface Industry {
  id: number;
  name: string;
  industryType: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  emissionLimit: number | null;
  status: "Compliant" | "Warning" | "Non-Compliant";
  createdAt: string;
  updatedAt: string;
}

interface IndustriesResponse {
  count: number;
  industries: Industry[];
}

export function useIndustries(status?: string) {
  return useFetch<IndustriesResponse>(
    () => api.getIndustries(status) as Promise<IndustriesResponse>,
    [status]
  );
}
