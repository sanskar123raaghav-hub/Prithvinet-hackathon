"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "./constants";

export interface LiveSensor {
  id: string;
  type: string;
  location: string;
  aqi?: number;
  pm25?: number;
  decibels?: number;
  ph?: number;
  dissolvedOxygen?: number;
}

export interface SensorUpdate {
  timestamp: string;
  sensors: LiveSensor[];
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<SensorUpdate | null>(null);
  const [liveSensors, setLiveSensors] = useState<LiveSensor[]>([]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("sensor-update", (data: SensorUpdate) => {
      setLastUpdate(data);
      setLiveSensors(data.sensors);
    });

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connect]);

  return { connected, lastUpdate, liveSensors };
}
