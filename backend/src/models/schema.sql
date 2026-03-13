-- PRITHVINET Database Schema
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('air', 'water', 'noise')),
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    status VARCHAR(20) DEFAULT 'active',
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(20) REFERENCES sensors(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Air quality fields
    aqi INTEGER,
    pm25 DECIMAL(6, 2),
    pm10 DECIMAL(6, 2),
    so2 DECIMAL(6, 2),
    no2 DECIMAL(6, 2),
    o3 DECIMAL(6, 2),
    co DECIMAL(6, 2),
    -- Water quality fields
    ph DECIMAL(4, 2),
    dissolved_oxygen DECIMAL(6, 2),
    bod DECIMAL(6, 2),
    tss DECIMAL(6, 2),
    turbidity DECIMAL(6, 2),
    coliform INTEGER,
    -- Noise fields
    decibels DECIMAL(5, 1),
    peak_db DECIMAL(5, 1)
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    sensor_id VARCHAR(20) REFERENCES sensors(id),
    location VARCHAR(255),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50),
    file_url VARCHAR(500),
    file_size VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    regulation_name VARCHAR(500) NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    measured_value DECIMAL(10, 2),
    limit_value DECIMAL(10, 2),
    unit VARCHAR(50),
    compliant BOOLEAN NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readings_sensor ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
