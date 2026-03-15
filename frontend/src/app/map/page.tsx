"use client";

import { useEffect, useRef, useState } from "react";

// ── AQI sample data for Indian cities ──────────────────────────────────────
const AQI_DATA = [
  { city: "Delhi",       lat: 28.6139, lng: 77.2090, aqi: 312, pm25: 189, pm10: 245 },
  { city: "Mumbai",      lat: 19.0760, lng: 72.8777, aqi: 142, pm25:  88, pm10: 121 },
  { city: "Kolkata",     lat: 22.5726, lng: 88.3639, aqi: 198, pm25: 124, pm10: 167 },
  { city: "Chennai",     lat: 13.0827, lng: 80.2707, aqi:  88, pm25:  54, pm10:  79 },
  { city: "Bengaluru",   lat: 12.9716, lng: 77.5946, aqi:  76, pm25:  44, pm10:  68 },
  { city: "Hyderabad",   lat: 17.3850, lng: 78.4867, aqi: 118, pm25:  71, pm10: 102 },
  { city: "Ahmedabad",   lat: 23.0225, lng: 72.5714, aqi: 167, pm25: 105, pm10: 141 },
  { city: "Pune",        lat: 18.5204, lng: 73.8567, aqi:  95, pm25:  58, pm10:  84 },
  { city: "Jaipur",      lat: 26.9124, lng: 75.7873, aqi: 224, pm25: 142, pm10: 188 },
  { city: "Lucknow",     lat: 26.8467, lng: 80.9462, aqi: 289, pm25: 178, pm10: 231 },
  { city: "Kanpur",      lat: 26.4499, lng: 80.3319, aqi: 335, pm25: 207, pm10: 271 },
  { city: "Patna",       lat: 25.5941, lng: 85.1376, aqi: 276, pm25: 168, pm10: 219 },
  { city: "Surat",       lat: 21.1702, lng: 72.8311, aqi: 143, pm25:  89, pm10: 122 },
  { city: "Bhopal",      lat: 23.2599, lng: 77.4126, aqi: 131, pm25:  80, pm10: 112 },
  { city: "Nagpur",      lat: 21.1458, lng: 79.0882, aqi: 109, pm25:  66, pm10:  94 },
  { city: "Visakhapatnam",lat:17.6868, lng: 83.2185, aqi:  72, pm25:  42, pm10:  64 },
  { city: "Guwahati",    lat: 26.1445, lng: 91.7362, aqi:  98, pm25:  60, pm10:  86 },
  { city: "Chandigarh",  lat: 30.7333, lng: 76.7794, aqi: 178, pm25: 111, pm10: 150 },
  { city: "Kochi",       lat:  9.9312, lng: 76.2673, aqi:  61, pm25:  36, pm10:  54 },
  { city: "Indore",      lat: 22.7196, lng: 75.8577, aqi: 152, pm25:  95, pm10: 129 },
];

type AqiCategory = { label: string; color: string; bg: string; range: string };

function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50)  return { label: "Good",          color: "#00e400", bg: "rgba(0,228,64,0.15)",   range: "0–50"   };
  if (aqi <= 100) return { label: "Satisfactory",  color: "#92d050", bg: "rgba(146,208,80,0.15)", range: "51–100" };
  if (aqi <= 200) return { label: "Moderate",      color: "#ffff00", bg: "rgba(255,255,0,0.15)",  range: "101–200"};
  if (aqi <= 300) return { label: "Poor",          color: "#ff7e00", bg: "rgba(255,126,0,0.15)",  range: "201–300"};
  if (aqi <= 400) return { label: "Very Poor",     color: "#ff0000", bg: "rgba(255,0,0,0.15)",    range: "301–400"};
  return                  { label: "Severe",        color: "#7e0023", bg: "rgba(126,0,35,0.15)",   range: "401+"   };
}

function getPulseRadius(aqi: number): number {
  if (aqi <= 50)  return 30;
  if (aqi <= 100) return 38;
  if (aqi <= 200) return 46;
  if (aqi <= 300) return 56;
  if (aqi <= 400) return 66;
  return 80;
}

// ── Stats derived from data ────────────────────────────────────────────────
const avgAqi   = Math.round(AQI_DATA.reduce((s, d) => s + d.aqi, 0) / AQI_DATA.length);
const maxEntry = AQI_DATA.reduce((a, b) => (a.aqi > b.aqi ? a : b));
const minEntry = AQI_DATA.reduce((a, b) => (a.aqi < b.aqi ? a : b));
const severeCount = AQI_DATA.filter(d => d.aqi > 300).length;

export default function MapPage() {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapInstance= useRef<unknown>(null);
  const [selected, setSelected] = useState<typeof AQI_DATA[0] | null>(null);
  const [loaded,   setLoaded  ] = useState(false);

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    // Dynamically load Leaflet + heatmap plugin
    const loadLeaflet = async () => {
      // Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Leaflet JS
      await new Promise<void>((resolve) => {
        if ((window as unknown as Record<string,unknown>).L) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

      // Leaflet.heat plugin
      await new Promise<void>((resolve) => {
        const win = window as unknown as Record<string,unknown>;
        if ((win.L as Record<string,unknown>)?.heatLayer) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

      const L = (window as unknown as Record<string, unknown>).L as typeof import("leaflet");

      const map = L.map(mapRef.current!, {
        center: [22.5, 82.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: "© CARTO · OSM" }).addTo(map);

      // Heatmap layer
      const heatPoints = AQI_DATA.map(d => [d.lat, d.lng, d.aqi / 500] as [number, number, number]);
      (L as unknown as Record<string, (pts: [number,number,number][], opts: object) => { addTo: (m: unknown) => void }>)
        .heatLayer(heatPoints, {
          radius: 60,
          blur: 40,
          maxZoom: 8,
          max: 1.0,
          gradient: {
            0.0:  "#00e400",
            0.2:  "#92d050",
            0.4:  "#ffff00",
            0.55: "#ff7e00",
            0.75: "#ff0000",
            1.0:  "#7e0023",
          },
        }).addTo(map);

      // Custom circle markers
      AQI_DATA.forEach(point => {
        const cat = getAqiCategory(point.aqi);
        const r   = getPulseRadius(point.aqi);

        const marker = L.circleMarker([point.lat, point.lng], {
          radius: r / 5,
          color: cat.color,
          fillColor: cat.color,
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(map);

        const popupContent = `
          <div style="
            font-family: 'DM Mono', monospace, sans-serif;
            background: #0d1117;
            color: #e6edf3;
            border-radius: 10px;
            padding: 14px 16px;
            min-width: 200px;
            border: 1px solid ${cat.color}55;
          ">
            <div style="font-size:1.1rem;font-weight:700;margin-bottom:6px;">${point.city}</div>
            <div style="
              display:inline-block;
              background:${cat.bg};
              color:${cat.color};
              border:1px solid ${cat.color}66;
              border-radius:6px;
              padding:2px 10px;
              font-size:0.75rem;
              font-weight:600;
              margin-bottom:10px;
              letter-spacing:0.05em;
            ">${cat.label}</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <tr><td style="color:#8b949e;padding:3px 0;">AQI</td><td style="text-align:right;font-weight:700;color:${cat.color};">${point.aqi}</td></tr>
              <tr><td style="color:#8b949e;padding:3px 0;">PM2.5</td><td style="text-align:right;">${point.pm25} µg/m³</td></tr>
              <tr><td style="color:#8b949e;padding:3px 0;">PM10</td><td style="text-align:right;">${point.pm10} µg/m³</td></tr>
            </table>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "prithvi-popup",
          maxWidth: 240,
          closeButton: false,
        });

        marker.on("click", () => {
          setSelected(point);
        });
      });

      mapInstance.current = map;
      setLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const selCat = selected ? getAqiCategory(selected.aqi) : null;

  return (
    <>
      {/* ── Popup style override ───────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

        .prithvi-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
          border-radius: 10px !important;
        }
        .prithvi-popup .leaflet-popup-tip-container { display: none; }
        .prithvi-popup .leaflet-popup-content { margin: 0 !important; }

        .leaflet-attribution-flag { display: none !important; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,126,0,0); }
          50%       { box-shadow: 0 0 0 8px rgba(255,126,0,0.15); }
        }
        .stat-card { animation: fadeSlideUp 0.5s ease both; }
        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.12s; }
        .stat-card:nth-child(3) { animation-delay: 0.19s; }
        .stat-card:nth-child(4) { animation-delay: 0.26s; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080c14",
        color: "#e6edf3",
        fontFamily: "'Syne', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <header style={{
          padding: "20px 32px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(8,12,20,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00e400 0%, #00b4d8 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "0 0 16px rgba(0,228,64,0.35)",
            }}>🌿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.08em", color: "#fff" }}>
                PRITHVI NET
              </div>
              <div style={{ fontSize: "0.65rem", color: "#8b949e", letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace" }}>
                AIR QUALITY INTELLIGENCE
              </div>
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "0.72rem",
            fontFamily: "'DM Mono', monospace",
            color: "#8b949e",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e400", display: "inline-block", boxShadow: "0 0 6px #00e400" }} />
            LIVE · INDIA
          </div>
        </header>

        {/* ── Stat bar ─────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[
            { label: "National Avg AQI", value: avgAqi,          unit: "",        color: getAqiCategory(avgAqi).color   },
            { label: "Most Polluted",    value: maxEntry.city,    unit: maxEntry.aqi + " AQI", color: "#ff0000"           },
            { label: "Cleanest City",    value: minEntry.city,    unit: minEntry.aqi + " AQI", color: "#00e400"           },
            { label: "Severe Zones",     value: severeCount,      unit: "cities",  color: "#7e0023"                       },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{
              padding: "16px 24px",
              background: "#0d1117",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.62rem", color: "#8b949e", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              {s.unit && (
                <div style={{ fontSize: "0.68rem", color: "#8b949e", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                  {s.unit}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Main layout ──────────────────────────────────────────── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Map */}
          <div style={{ flex: 1, position: "relative" }}>
            <div
              ref={mapRef}
              style={{ width: "100%", height: "calc(100vh - 160px)", minHeight: 500 }}
            />

            {/* Loading overlay */}
            {!loaded && (
              <div style={{
                position: "absolute", inset: 0,
                background: "#080c14",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, zIndex: 999,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.08)",
                  borderTop: "3px solid #00e400",
                  animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ fontFamily: "'DM Mono', monospace", color: "#8b949e", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
                  LOADING MAP…
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Legend */}
            <div style={{
              position: "absolute", bottom: 24, left: 16, zIndex: 900,
              background: "rgba(13,17,23,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "12px 16px",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ fontSize: "0.6rem", color: "#8b949e", letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
                AQI LEGEND
              </div>
              {[
                { label: "Good",         color: "#00e400", range: "0–50"    },
                { label: "Satisfactory", color: "#92d050", range: "51–100"  },
                { label: "Moderate",     color: "#ffff00", range: "101–200" },
                { label: "Poor",         color: "#ff7e00", range: "201–300" },
                { label: "Very Poor",    color: "#ff0000", range: "301–400" },
                { label: "Severe",       color: "#7e0023", range: "401+"    },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.72rem", color: "#c9d1d9", minWidth: 88 }}>{item.label}</span>
                  <span style={{ fontSize: "0.65rem", color: "#8b949e", fontFamily: "'DM Mono', monospace" }}>{item.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Side panel ─────────────────────────────────────────── */}
          <div style={{
            width: 280,
            background: "#0d1117",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Selected city detail */}
            {selected && selCat ? (
              <div style={{
                padding: "20px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                animation: "fadeSlideUp 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{selected.city}</div>
                    <div style={{
                      display: "inline-block", marginTop: 4,
                      background: selCat.bg, color: selCat.color,
                      border: `1px solid ${selCat.color}55`,
                      borderRadius: 6, padding: "2px 10px",
                      fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em",
                    }}>
                      {selCat.label}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: 800, color: selCat.color, lineHeight: 1 }}>
                      {selected.aqi}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "#8b949e", fontFamily: "'DM Mono', monospace" }}>AQI INDEX</div>
                  </div>
                </div>

                {/* Gauge bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min((selected.aqi / 500) * 100, 100)}%`,
                      background: `linear-gradient(90deg, #00e400, ${selCat.color})`,
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>

                {/* Pollutant rows */}
                {[
                  { label: "PM2.5", value: selected.pm25, unit: "µg/m³", max: 250 },
                  { label: "PM10",  value: selected.pm10, unit: "µg/m³", max: 350 },
                ].map(p => (
                  <div key={p.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.72rem", color: "#8b949e", fontFamily: "'DM Mono', monospace" }}>{p.label}</span>
                      <span style={{ fontSize: "0.72rem", color: "#c9d1d9", fontFamily: "'DM Mono', monospace" }}>{p.value} {p.unit}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min((p.value / p.max) * 100, 100)}%`,
                        background: selCat.color,
                        borderRadius: 3,
                        opacity: 0.75,
                      }} />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setSelected(null)}
                  style={{
                    marginTop: 8, width: "100%", padding: "7px 0",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "#8b949e",
                    fontSize: "0.7rem", cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em",
                  }}
                >
                  CLEAR SELECTION
                </button>
              </div>
            ) : (
              <div style={{
                padding: "20px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "0.62rem", color: "#8b949e", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
                  CITY DETAILS
                </div>
                <div style={{ fontSize: "0.8rem", color: "#484f58" }}>
                  Click any marker on the map to view detailed AQI data.
                </div>
              </div>
            )}

            {/* City list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
              <div style={{ fontSize: "0.6rem", color: "#8b949e", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", padding: "0 18px 8px" }}>
                ALL CITIES · RANKED
              </div>
              {[...AQI_DATA].sort((a, b) => b.aqi - a.aqi).map(point => {
                const cat = getAqiCategory(point.aqi);
                const isActive = selected?.city === point.city;
                return (
                  <div
                    key={point.city}
                    onClick={() => setSelected(point)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 18px",
                      cursor: "pointer",
                      background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                      borderLeft: isActive ? `2px solid ${cat.color}` : "2px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "0.8rem", color: isActive ? "#fff" : "#c9d1d9" }}>{point.city}</span>
                    <span style={{ fontSize: "0.72rem", color: cat.color, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      {point.aqi}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
