-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('shipper', 'carrier', 'government')),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles/Vessels table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('truck', 'ship', 'train', 'plane')),
    model VARCHAR(255),
    year INTEGER,
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('diesel', 'gasoline', 'electric', 'hybrid', 'lng', 'hydrogen')),
    capacity_kg INTEGER,
    max_speed_kmh INTEGER,
    emission_factor_kg_per_km DECIMAL(10,6), -- kg CO2 per km
    fuel_efficiency_l_per_100km DECIMAL(8,4),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255),
    origin_name VARCHAR(255),
    origin_coordinates POINT, -- PostGIS point type
    destination_name VARCHAR(255),
    destination_coordinates POINT,
    cargo_type VARCHAR(100),
    cargo_weight_kg INTEGER,
    transport_modes TEXT[], -- array of transport modes
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Route segments table (for multimodal routes)
CREATE TABLE route_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id),
    segment_order INTEGER, -- 1st segment, 2nd segment, etc.
    transport_mode VARCHAR(50),
    vehicle_id UUID REFERENCES vehicles(id),
    start_coordinates POINT,
    end_coordinates POINT,
    distance_km DECIMAL(10,4),
    estimated_duration_hours DECIMAL(8,4),
    estimated_co2_kg DECIMAL(10,4),
    estimated_fuel_cost DECIMAL(10,2),
    route_geometry TEXT, -- GeoJSON or encoded polyline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emission logs table (time-series data)
CREATE TABLE emission_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id),
    vehicle_id UUID REFERENCES vehicles(id),
    timestamp_utc TIMESTAMP NOT NULL,
    location_coordinates POINT,
    co2_emitted_kg DECIMAL(10,4),
    fuel_consumed_liters DECIMAL(10,4),
    distance_traveled_km DECIMAL(10,4),
    speed_kmh DECIMAL(8,4),
    weather_conditions JSONB, -- store weather data as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data cache table
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_coordinates POINT,
    timestamp_utc TIMESTAMP,
    temperature_celsius DECIMAL(5,2),
    wind_speed_kmh DECIMAL(8,4),
    wind_direction_degrees INTEGER,
    wave_height_m DECIMAL(5,2), -- for maritime routes
    weather_conditions VARCHAR(100),
    data_source VARCHAR(50), -- which API provided this data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_emission_logs_route_id ON emission_logs(route_id);
CREATE INDEX idx_emission_logs_timestamp ON emission_logs(timestamp_utc);
CREATE INDEX idx_weather_data_location ON weather_data USING GIST(location_coordinates);
CREATE INDEX idx_weather_data_timestamp ON weather_data(timestamp_utc);

-- Insert sample data
INSERT INTO organizations (name, type, contact_email) VALUES
('Green Shipping Co', 'carrier', 'contact@greenshipping.com'),
('EcoLogistics Ltd', 'shipper', 'info@ecologistics.com'),
('Maritime Authority', 'government', 'admin@maritime.gov');

-- Insert sample user (password is 'password123' hashed)
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role) VALUES
((SELECT id FROM organizations WHERE name = 'Green Shipping Co'), 'admin@greenshipping.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8.jjmVVB5dT8zd8v8Q2', 'John', 'Doe', 'admin');

-- Insert sample vehicles
INSERT INTO vehicles (organization_id, name, type, model, year, fuel_type, capacity_kg, emission_factor_kg_per_km, fuel_efficiency_l_per_100km) VALUES
((SELECT id FROM organizations WHERE name = 'Green Shipping Co'), 'Truck-001', 'truck', 'Volvo FH16', 2022, 'diesel', 40000, 0.95, 35.5),
((SELECT id FROM organizations WHERE name = 'Green Shipping Co'), 'Ship-001', 'ship', 'Container Vessel', 2021, 'lng', 50000000, 2.1, 180.0);