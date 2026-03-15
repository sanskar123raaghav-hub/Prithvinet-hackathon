-- ============================================
-- PRITHVINET — PostgreSQL Database Schema
-- Environmental Intelligence Platform
-- ============================================

-- Users: operators, admins, analysts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'analyst', 'public')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Sensors: IoT devices deployed across regions
CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('air', 'water', 'noise')),
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat TIMESTAMP
);

-- Sensor readings: time-series environmental data
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(20) NOT NULL REFERENCES sensors(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Air quality
    aqi INTEGER,
    pm25 DECIMAL(6, 2),
    pm10 DECIMAL(6, 2),
    so2 DECIMAL(6, 2),
    no2 DECIMAL(6, 2),
    o3 DECIMAL(6, 2),
    co DECIMAL(6, 2),

    -- Water quality
    ph DECIMAL(4, 2),
    dissolved_oxygen DECIMAL(6, 2),
    bod DECIMAL(6, 2),
    tss DECIMAL(6, 2),
    turbidity DECIMAL(6, 2),
    coliform INTEGER,

    -- Noise
    decibels DECIMAL(5, 1),
    peak_db DECIMAL(5, 1)
);

-- Alerts: threshold violations
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    sensor_id VARCHAR(20) REFERENCES sensors(id),
    location VARCHAR(255),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports: published environmental reports
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('annual', 'quarterly', 'special', 'infrastructure')),
    file_url VARCHAR(500),
    file_size VARCHAR(20),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance checks: regulatory monitoring
CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    regulation_name VARCHAR(500) NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    measured_value DECIMAL(10, 2),
    limit_value DECIMAL(10, 2),
    unit VARCHAR(50),
    compliant BOOLEAN NOT NULL,
    sensor_id VARCHAR(20) REFERENCES sensors(id),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI forecast logs: prediction history
CREATE TABLE IF NOT EXISTS forecast_logs (
    id SERIAL PRIMARY KEY,
    pollution_type VARCHAR(20) NOT NULL CHECK (pollution_type IN ('air', 'water', 'noise')),
    model_version VARCHAR(20),
    forecast_hours INTEGER,
    predictions JSONB,
    confidence_avg DECIMAL(5, 2),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Industries: registered industrial facilities for compliance tracking
CREATE TABLE IF NOT EXISTS industries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(100),
    location VARCHAR(100),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    emission_level DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Compliant' CHECK (status IN ('Compliant', 'Warning', 'Non-Compliant')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration for existing tables
DO $$
BEGIN
    -- Only run if old columns exist
    IF EXISTS (SELECT column_name FROM information_schema.columns 
               WHERE table_name='industries' AND column_name='region') THEN
        ALTER TABLE industries RENAME COLUMN region TO location;
    END IF;
    IF EXISTS (SELECT column_name FROM information_schema.columns 
               WHERE table_name='industries' AND column_name='emission_limit') THEN
        ALTER TABLE industries RENAME COLUMN emission_limit TO emission_level;
    END IF;
    -- Make industry_type optional if it was NOT NULL
    ALTER TABLE industries ALTER COLUMN industry_type DROP NOT NULL;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_readings_sensor ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_readings_time ON sensor_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_ack ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_regulation ON compliance_checks(regulation_name);
CREATE INDEX IF NOT EXISTS idx_forecast_type ON forecast_logs(pollution_type);
CREATE INDEX IF NOT EXISTS idx_industries_status ON industries(status);
CREATE INDEX IF NOT EXISTS idx_industries_location ON industries(location);
CREATE INDEX IF NOT EXISTS idx_industries_status ON industries(status);
