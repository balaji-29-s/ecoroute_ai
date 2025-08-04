import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { fetchRoutes } from '../api';
import LoadingSpinner from './LoadingSpinner';
import Sidebar from './Sidebar';

const ROUTE_COLORS = { 
  eco: '#10b981', 
  fastest: '#3b82f6', 
  alternate: '#6b7280' 
};

const ROUTE_NAMES = {
  eco: 'Eco-Friendly',
  fastest: 'Fastest',
  alternate: 'Alternative'
};

export default function MapComponent() {
  const mapRef = useRef();
  const [origin, setOrigin] = useState([51.5, -0.1]);
  const [destination, setDestination] = useState([51.52, -0.12]);
  const [mode, setMode] = useState('car');
  const [vehicleType, setVehicleType] = useState('petrol');
  const [trafficCondition, setTrafficCondition] = useState('normal');
  const [cargoWeight, setCargoWeight] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(origin, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
      
      // Force a resize after initialization to ensure proper display
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, []);

  // Handle map resizing when routes are updated
  useEffect(() => {
    if (mapRef.current && routes.length > 0) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 50);
    }
  }, [routes]);

  const calculateRoute = () => {
    setLoading(true);
    setError(null);
    console.log("Fetching routes for:", { origin, destination, mode, vehicleType, trafficCondition, cargoWeight });
    
    fetchRoutes(origin, destination, mode, vehicleType, trafficCondition, cargoWeight)
      .then(data => {
        console.log("API Response:", data);
        setLoading(false);
        
        if (!data.success) {
          console.error("API failed:", data);
          setError("Failed to fetch routes from backend: " + (data.detail || "Unknown error"));
          return;
        }
        
        setRoutes(data.routes);
        setSelected(null);
        const map = mapRef.current;
        
        // Remove old polylines
        map.eachLayer(layer => {
          if (layer instanceof L.Polyline && !layer._url) map.removeLayer(layer);
        });
        
        // Add new routes
        data.routes.forEach(route => {
          const latlngs = route.geometry.map(([lng, lat]) => [lat, lng]);
          const polyline = L.polyline(latlngs, {
            color: ROUTE_COLORS[route.type] || '#000',
            weight: 6,
            opacity: 0.8
          }).addTo(map);
          polyline.on('click', () => setSelected(route));
        });
        
        // Center map on new route
        if (data.routes.length > 0) {
          const latlngs = data.routes[0].geometry.map(([lng, lat]) => [lat, lng]);
          map.fitBounds(latlngs);
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setLoading(false);
        setError("Network error: " + error.message);
      });
  };

  const getVehicleOptions = () => {
    switch (mode) {
      case 'car':
        return [
          { value: 'petrol', label: 'Petrol Car' },
          { value: 'diesel', label: 'Diesel Car' },
          { value: 'hybrid', label: 'Hybrid Car' },
          { value: 'electric', label: 'Electric Car' },
          { value: 'suv', label: 'SUV' },
          { value: 'compact', label: 'Compact Car' }
        ];
      case 'truck':
        return [
          { value: 'small', label: 'Small Truck' },
          { value: 'medium', label: 'Medium Truck' },
          { value: 'large', label: 'Large Truck' },
          { value: 'articulated', label: 'Articulated Truck' }
        ];
      case 'motorcycle':
        return [
          { value: 'small', label: 'Small Motorcycle' },
          { value: 'medium', label: 'Medium Motorcycle' },
          { value: 'large', label: 'Large Motorcycle' }
        ];
      case 'bike':
        return [
          { value: 'manual', label: 'Manual Bike' },
          { value: 'electric', label: 'E-Bike' }
        ];
      default:
        return [{ value: 'default', label: 'Default' }];
    }
  };

  const handleCoordinateChange = (type, value) => {
    const coords = value.split(',').map(Number);
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      if (type === 'origin') {
        setOrigin(coords);
      } else {
        setDestination(coords);
      }
    }
  };

  return (
    <div className="d-flex h-full">
      {/* Main Map Area */}
      <div className="flex-1 d-flex flex-column">
        {/* Header */}
        <div className="card mb-0 rounded-0">
          <div className="card-header">
            <div className="d-flex align-center justify-between">
              <h2 className="mb-0">
                <span style={{ color: 'var(--primary-color)' }}>Eco</span>Route AI
              </h2>
              <div className="badge badge-success">
                <span className="spinner mr-2"></span>
                Live Traffic
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="card mb-3 mx-3 mt-3">
          <div className="card-body">
            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
              
              {/* Origin Input */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ color: 'var(--success-color)' }}>📍</span> Origin Coordinates
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={origin.join(',')}
                  onChange={(e) => handleCoordinateChange('origin', e.target.value)}
                  placeholder="lat, lng (e.g., 51.5, -0.1)"
                />
              </div>

              {/* Destination Input */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ color: 'var(--danger-color)' }}>🎯</span> Destination Coordinates
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={destination.join(',')}
                  onChange={(e) => handleCoordinateChange('destination', e.target.value)}
                  placeholder="lat, lng (e.g., 51.52, -0.12)"
                />
              </div>

              {/* Transport Mode */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ color: 'var(--primary-color)' }}>🚗</span> Transport Mode
                </label>
                <select 
                  className="form-select" 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="truck">Truck</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              {/* Vehicle Type */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ color: 'var(--accent-color)' }}>⚙️</span> Vehicle Type
                </label>
                <select 
                  className="form-select" 
                  value={vehicleType} 
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  {getVehicleOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Traffic Condition */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ color: 'var(--warning-color)' }}>🚦</span> Traffic Condition
                </label>
                <select 
                  className="form-select" 
                  value={trafficCondition} 
                  onChange={(e) => setTrafficCondition(e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="highway">Highway</option>
                  <option value="urban">Urban</option>
                  <option value="rural">Rural</option>
                  <option value="congested">Congested</option>
                </select>
              </div>

              {/* Cargo Weight (for trucks) */}
              {mode === 'truck' && (
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ color: 'var(--secondary-color)' }}>📦</span> Cargo Weight (kg)
                  </label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={cargoWeight} 
                    onChange={(e) => setCargoWeight(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex align-center justify-between mt-4">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={calculateRoute}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" text="" />
                      Calculating Routes...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Calculate Route
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setRoutes([]);
                    setSelected(null);
                    setError(null);
                    const map = mapRef.current;
                    map.eachLayer(layer => {
                      if (layer instanceof L.Polyline && !layer._url) map.removeLayer(layer);
                    });
                  }}
                >
                  <span>🗑️</span>
                  Clear Routes
                </button>
              </div>

              {/* Status Indicators */}
              <div className="d-flex align-center gap-2">
                {loading && (
                  <div className="badge badge-info">
                    <LoadingSpinner size="sm" text="" />
                    Processing...
                  </div>
                )}
                {error && (
                  <div className="badge badge-danger">
                    <span>⚠️</span>
                    Error
                  </div>
                )}
                {routes.length > 0 && (
                  <div className="badge badge-success">
                    <span>✅</span>
                    {routes.length} Routes Found
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 rounded" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 map-container mx-3 mb-3">
          <div id="map" className="h-full" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 d-flex flex-column">
        <Sidebar route={selected} routes={routes} onRouteSelect={setSelected} />
      </div>
    </div>
  );
}