# PRITHVINET — AI-Driven Environmental Intelligence Platform

> From Invisible Pollution to Visible Intelligence

PRITHVINET is a unified environmental monitoring and intelligence system that collects real-time environmental data, uses AI to predict pollution trends, tracks regulatory compliance, and provides public transparency dashboards.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Next.js App    │◄──►│  Express API     │◄──►│  PostgreSQL      │
│   (Port 3000)    │    │  (Port 5000)     │    │  (Port 5432)     │
└─────────────────┘    └──────┬───────────┘    └──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Python AI Service  │
                    │  (Port 5001)        │
                    └────────────────────┘
```

## Tech Stack

- **Frontend:** Next.js 14, TailwindCSS, Framer Motion, Recharts, Leaflet
- **Backend:** Node.js + Express, JWT Auth, Socket.io (WebSocket)
- **AI Service:** Python Flask, NumPy, Pandas, scikit-learn
- **Database:** PostgreSQL 16
- **Deployment:** Docker, Docker Compose, Vercel-ready

## Features

- **Real-Time Monitoring** — Live sensor data for air, water, and noise pollution
- **AI Forecasting** — ML-powered predictions for 24–72 hours ahead
- **Compliance Tracking** — Automated regulatory compliance monitoring
- **Geospatial Maps** — Interactive pollution heatmaps with Leaflet
- **Smart Alerts** — Threshold-based alerts with severity and escalation
- **Public Portal** — Citizen transparency dashboard with downloadable reports
- **JWT Authentication** — Secure login for operators and administrators

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero, features |
| `/dashboard` | Real-time environmental dashboard |
| `/map` | Geospatial pollution map |
| `/forecasting` | AI pollution forecasting |
| `/compliance` | Regulatory compliance tracking |
| `/alerts` | Smart alert management |
| `/transparency` | Public citizen portal |
| `/login` | Secure authentication |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 16 (or Docker)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3000

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Edit with your database credentials
npm run dev
```
Runs on http://localhost:5000

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
Runs on http://localhost:5001

### Docker (Full Stack)
```bash
docker-compose up --build
```
This starts all services: frontend (3000), backend (5000), AI service (5001), PostgreSQL (5432).

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT token
- `GET /api/auth/me` — Get current user (requires auth)

### Sensors
- `GET /api/sensors` — List all sensors (filter by `?type=air`)
- `GET /api/sensors/:id` — Sensor details
- `GET /api/sensors/:id/readings` — Historical readings

### Alerts
- `GET /api/alerts` — List alerts (filter by `?severity=critical`)
- `POST /api/alerts/:id/acknowledge` — Acknowledge alert (requires auth)

### Reports
- `GET /api/reports` — List public reports

### Forecast
- `GET /api/forecast/:type` — AI predictions (`air`, `water`, `noise`)

### WebSocket
Connect to `ws://localhost:5000` for real-time `sensor-update` events every 5 seconds.

## Project Structure

```
prithvinet/
├── frontend/               # Next.js 14 App
│   ├── src/app/            # App Router pages
│   └── src/components/     # React components
├── backend/                # Express REST API
│   └── src/
│       ├── routes/         # API route handlers
│       ├── middleware/      # JWT auth middleware
│       └── models/         # PostgreSQL schema
├── ai-service/             # Python Flask ML service
├── docker-compose.yml      # Full stack orchestration
└── README.md
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/prithvinet
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

## License

MIT
