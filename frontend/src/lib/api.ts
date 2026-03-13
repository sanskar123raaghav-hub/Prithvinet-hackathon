/**
 * PRITHVINET API Client
 * Centralized HTTP client for backend communication.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string; role: string; name: string } }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  register: (email: string, password: string, name?: string) =>
    request("/auth/register", { method: "POST", body: { email, password, name } }),
  me: (token: string) => request("/auth/me", { token }),

  // Sensors
  getSensors: (type?: string) =>
    request(`/sensors${type ? `?type=${type}` : ""}`),
  getSensor: (id: string) => request(`/sensors/${id}`),
  getSensorReadings: (id: string) => request(`/sensors/${id}/readings`),

  // Alerts
  getAlerts: (severity?: string) =>
    request(`/alerts${severity ? `?severity=${severity}` : ""}`),
  acknowledgeAlert: (id: number, token: string) =>
    request(`/alerts/${id}/acknowledge`, { method: "POST", token }),

  // Reports
  getReports: () => request("/reports"),

  // Forecast
  getForecast: (type: string, hours = 72) =>
    request(`/forecast/${type}?hours=${hours}`),

  // Industries
  getIndustries: (status?: string) =>
    request(`/industries${status ? `?status=${status}` : ""}`),
  getIndustry: (id: number) => request(`/industries/${id}`),
  createIndustry: (body: Record<string, unknown>) =>
    request("/industries", { method: "POST", body }),
  updateIndustry: (id: number, body: Record<string, unknown>) =>
    request(`/industries/${id}`, { method: "PUT", body }),
  deleteIndustry: (id: number) =>
    request(`/industries/${id}`, { method: "DELETE" }),
};
