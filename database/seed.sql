-- ============================================
-- PRITHVINET — Seed Data
-- Sample sensors, readings, and alerts
-- ============================================

-- Default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@prithvinet.gov', '$2a$10$kIqR0hJXl5TUxHjN0u7J9uOFgaN3R5fA5nE7dU7O6bM3VeA2.XWXS', 'System Administrator', 'admin'),
  ('operator@prithvinet.gov', '$2a$10$kIqR0hJXl5TUxHjN0u7J9uOFgaN3R5fA5nE7dU7O6bM3VeA2.XWXS', 'Field Operator', 'operator')
ON CONFLICT (email) DO NOTHING;

-- Sensors
INSERT INTO sensors (id, type, location, region, latitude, longitude, status) VALUES
  ('S1042', 'air',   'Delhi Central',          'North India', 28.6139,  77.2090,  'active'),
  ('S2015', 'air',   'Mumbai Coastal',         'West India',  19.0760,  72.8777,  'active'),
  ('S3001', 'air',   'Bangalore South',        'South India', 12.9716,  77.5946,  'active'),
  ('S3012', 'air',   'Kolkata Industrial',      'East India',  22.5726,  88.3639,  'active'),
  ('S4501', 'water', 'Chennai Harbor',          'South India', 13.0827,  80.2707,  'active'),
  ('S4502', 'water', 'Yamuna River Station 7',  'North India', 28.5500,  77.2500,  'active'),
  ('S2081', 'noise', 'Ahmedabad Industrial',    'West India',  23.0225,  72.5714,  'active'),
  ('S6010', 'noise', 'Hyderabad Tech Park',     'South India', 17.3850,  78.4867,  'active'),
  ('S5023', 'air',   'Jaipur Heritage',         'North India', 26.9124,  75.7873,  'active')
ON CONFLICT (id) DO NOTHING;

-- Sample alerts (matching new threshold rules)
INSERT INTO alerts (type, severity, message, sensor_id, location) VALUES
  ('Air Quality', 'critical', 'PM2.5 exceeded 150 µg/m³ at Delhi Central',                'S1042', 'Delhi Central'),
  ('Noise', 'warning', 'Noise level exceeded 85 dB at Ahmedabad Industrial',               'S2081', 'Ahmedabad Industrial'),
  ('Water Quality', 'warning', 'Water pH outside 6.5–8.5 range at Chennai Harbor',         'S4501', 'Chennai Harbor'),
  ('Air Quality', 'warning', 'PM2.5 exceeded 150 µg/m³ at Kolkata Industrial',             'S3012', 'Kolkata Industrial'),
  ('Noise', 'warning', 'Noise level exceeded 85 dB at Hyderabad Tech Park',                'S6010', 'Hyderabad Tech Park')
ON CONFLICT DO NOTHING;

-- Industries
INSERT INTO industries (name, industry_type, location, latitude, longitude, emission_level, status) VALUES
  ('Raipur Steel Plant',    'Steel',    'Chhattisgarh',    21.2514, 81.6296, 150.00, 'Non-Compliant'),
  ('Surat Textile Factory',  'Textile',  'Gujarat',         21.1702, 72.8311,  80.00, 'Warning'),
  ('Vizag Chemical Plant',   'Chemical', 'Andhra Pradesh',  17.6868, 83.2185, 100.00, 'Compliant')
ON CONFLICT (name) DO UPDATE SET
  industry_type = EXCLUDED.industry_type,
  location = EXCLUDED.location,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  emission_level = EXCLUDED.emission_level,
  status = EXCLUDED.status
RETURNING *;

-- Sample reports
INSERT INTO reports (title, category, file_size) VALUES
  ('Annual Environmental Report 2025',              'annual',         '4.2 MB'),
  ('Q4 2025 Air Quality Analysis',                  'quarterly',      '2.8 MB'),
  ('Water Quality Assessment — Yamuna Basin',        'special',        '3.1 MB'),
  ('Noise Pollution Study — Metro Cities',           'special',        '1.9 MB'),
  ('Sensor Network Coverage Report',                 'infrastructure', '1.2 MB');
