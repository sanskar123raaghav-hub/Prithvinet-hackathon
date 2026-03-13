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

-- Sample alerts
INSERT INTO alerts (type, severity, message, sensor_id, location) VALUES
  ('Air Quality', 'critical', 'PM2.5 level exceeded 150 µg/m³ in Delhi Central zone',    'S1042', 'Delhi Central'),
  ('Water Quality', 'critical', 'Dissolved oxygen dropped below 4.0 mg/L',                'S4502', 'Yamuna River Station 7'),
  ('Noise', 'warning', 'Industrial zone noise exceeded 75 dB threshold',                   'S2081', 'Ahmedabad Industrial'),
  ('Air Quality', 'warning', 'Ozone concentration approaching threshold',                  'S3012', 'Kolkata Industrial'),
  ('Water Quality', 'info', 'pH levels normalized at Chennai Harbor station',               'S4501', 'Chennai Harbor');

-- Industries
INSERT INTO industries (name, industry_type, region, latitude, longitude, emission_limit, status) VALUES
  ('Raipur Steel Plant',    'Steel',    'Chhattisgarh',    21.2514, 81.6296, 150.00, 'Non-Compliant'),
  ('Surat Textile Factory',  'Textile',  'Gujarat',         21.1702, 72.8311,  80.00, 'Warning'),
  ('Vizag Chemical Plant',   'Chemical', 'Andhra Pradesh',  17.6868, 83.2185, 100.00, 'Compliant')
ON CONFLICT DO NOTHING;

-- Sample reports
INSERT INTO reports (title, category, file_size) VALUES
  ('Annual Environmental Report 2025',              'annual',         '4.2 MB'),
  ('Q4 2025 Air Quality Analysis',                  'quarterly',      '2.8 MB'),
  ('Water Quality Assessment — Yamuna Basin',        'special',        '3.1 MB'),
  ('Noise Pollution Study — Metro Cities',           'special',        '1.9 MB'),
  ('Sensor Network Coverage Report',                 'infrastructure', '1.2 MB');
