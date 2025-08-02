import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { fetchRoutes } from '../api';
import Sidebar from './Sidebar';

const ROUTE_COLORS = { eco: 'green', fastest: 'blue', alternate: 'gray' };

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

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(origin, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }
  }, []);

  const calculateRoute = () => {
    setLoading(true);
    console.log("Fetching routes for:", { origin, destination, mode, vehicleType, trafficCondition, cargoWeight });
    
    fetchRoutes(origin, destination, mode, vehicleType, trafficCondition, cargoWeight)
      .then(data => {
        console.log("API Response:", data);
        setLoading(false);
        
        if (!data.success) {
          console.error("API failed:", data);
          alert("Failed to fetch routes from backend: " + (data.detail || "Unknown error"));
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
            color: ROUTE_COLORS[route.type] || 'black',
            weight: 5,
            opacity: 0.7
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
        alert("Network error: " + error.message);
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

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '70vw', height: '100vh' }}>
        <div style={{ padding: 10, display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <label>Origin: <input value={origin.join(',')} onChange={e => setOrigin(e.target.value.split(',').map(Number))} /></label>
          <label>Destination: <input value={destination.join(',')} onChange={e => setDestination(e.target.value.split(',').map(Number))} /></label>
          <label>Mode:
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </label>
          <label>Vehicle Type:
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
              {getVehicleOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>Traffic:
            <select value={trafficCondition} onChange={e => setTrafficCondition(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="highway">Highway</option>
              <option value="urban">Urban</option>
              <option value="rural">Rural</option>
              <option value="congested">Congested</option>
            </select>
          </label>
          {mode === 'truck' && (
            <label>Cargo Weight (kg):
              <input 
                type="number" 
                value={cargoWeight} 
                onChange={e => setCargoWeight(parseInt(e.target.value) || 0)}
                style={{ width: '80px' }}
              />
            </label>
          )}
          <button 
            onClick={calculateRoute}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Calculating...' : 'Calculate Route'}
          </button>
          {loading && <span style={{ color: 'blue' }}>Loading routes...</span>}
        </div>
        <div id="map" style={{ height: '90vh', width: '100%' }} />
      </div>
      <div style={{ width: '30vw', background: '#f8f8f8' }}>
        <Sidebar route={selected} />
      </div>
    </div>
  );
}