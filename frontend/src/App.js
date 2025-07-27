import { Calculator, Leaf, MapPin, Navigation, TreePine, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// API Service
const API_BASE_URL = 'http://localhost:8000';

const apiService = {
  calculateRoute: async (routeData) => {
    const response = await fetch(`${API_BASE_URL}/api/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routeData)
    });
    return response.json();
  },
  
  getHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};

// Mock data generator for fallback
const generateMockData = (routeData) => {
  const distance = calculateDistanceKm(
    routeData.origin_lat, routeData.origin_lng,
    routeData.destination_lat, routeData.destination_lng
  );
  
  const fuelEfficiency = { diesel: 3.5, electric: 0.2, lng: 4.2 }[routeData.fuel_type] || 3.5;
  const co2Factor = { diesel: 2.68, electric: 0.5, lng: 2.1 }[routeData.fuel_type] || 2.68;
  
  const fuelConsumed = distance / fuelEfficiency;
  const totalCo2 = fuelConsumed * co2Factor * (1 + routeData.cargo_weight_kg / 10000);
  const duration = distance / 70;
  const ecoScore = Math.max(0, 100 - (totalCo2 / distance * 50));
  
  return {
    success: true,
    route: {
      origin: { lat: routeData.origin_lat, lng: routeData.origin_lng },
      destination: { lat: routeData.destination_lat, lng: routeData.destination_lng },
      distance_km: Math.round(distance * 100) / 100,
      duration_hours: Math.round(duration * 100) / 100,
      transport_mode: routeData.transport_mode,
      fuel_type: routeData.fuel_type,
      cargo_weight_kg: routeData.cargo_weight_kg,
      geometry: [[routeData.origin_lng, routeData.origin_lat], [routeData.destination_lng, routeData.destination_lat]]
    },
    emissions: {
      total_co2_kg: Math.round(totalCo2 * 1000) / 1000,
      co2_per_km: Math.round((totalCo2 / distance) * 1000) / 1000,
      fuel_consumed_liters: Math.round(fuelConsumed * 100) / 100,
      fuel_cost_estimate: Math.round(fuelConsumed * 1.5 * 100) / 100
    },
    environmental_impact: {
      eco_score: Math.round(ecoScore * 10) / 10,
      trees_to_offset: Math.round((totalCo2 / 21.77) * 10) / 10,
      comparison: {
        vs_average_truck: `${Math.round(((2.5 - totalCo2/distance) / 2.5 * 100) * 10) / 10}% better`,
        vs_air_freight: "75% less emissions",
        rating: ecoScore > 70 ? "🌱 Eco-Friendly" : ecoScore > 40 ? "⚠️ Moderate" : "🚨 High Impact"
      }
    }
  };
};

// Calculate distance using Haversine formula
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Route Calculator Component
const RouteCalculator = ({ onRouteCalculated, onFormDataChange }) => {
  const [formData, setFormData] = useState({
    origin_lat: 28.6139,
    origin_lng: 77.2090,
    destination_lat: 28.4089,
    destination_lng: 77.4126,
    transport_mode: 'truck',
    fuel_type: 'diesel',
    cargo_weight_kg: 1000
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await apiService.calculateRoute(formData);
      onRouteCalculated(result);
    } catch (error) {
      console.error('Route calculation failed:', error);
      // Generate mock data as fallback
      const mockResult = generateMockData(formData);
      onRouteCalculated(mockResult);
      alert('Backend not available, showing demo data. Please ensure your FastAPI server is running on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: name.includes('_lat') || name.includes('_lng') ? parseFloat(value) : 
              name === 'cargo_weight_kg' ? parseInt(value) : value
    };
    setFormData(newFormData);
    
    // Notify parent component of form data changes for real-time map updates
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Calculator className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Route Calculator</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Latitude
            </label>
            <input
              type="number"
              name="origin_lat"
              value={formData.origin_lat}
              onChange={handleInputChange}
              step="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="28.6139"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Longitude
            </label>
            <input
              type="number"
              name="origin_lng"
              value={formData.origin_lng}
              onChange={handleInputChange}
              step="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="77.2090"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Latitude
            </label>
            <input
              type="number"
              name="destination_lat"
              value={formData.destination_lat}
              onChange={handleInputChange}
              step="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="28.4089"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Longitude
            </label>
            <input
              type="number"
              name="destination_lng"
              value={formData.destination_lng}
              onChange={handleInputChange}
              step="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="77.4126"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Mode
            </label>
            <select
              name="transport_mode"
              value={formData.transport_mode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="truck">Truck</option>
              <option value="ship">Ship</option>
              <option value="train">Train</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="lng">LNG</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo Weight (kg)
            </label>
            <input
              type="number"
              name="cargo_weight_kg"
              value={formData.cargo_weight_kg}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="1000"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Navigation className="w-5 h-5 mr-2" />
          )}
          {loading ? 'Calculating...' : 'Calculate Route'}
        </button>
      </form>
    </div>
  );
};

// Results Display Component
const RouteResults = ({ routeData }) => {
  if (!routeData || !routeData.success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Calculate a route to see results</p>
        </div>
      </div>
    );
  }

  const { route, emissions, environmental_impact } = routeData;

  return (
    <div className="space-y-6">
      {/* Route Info Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Navigation className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Route Information</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{route.distance_km}</div>
            <div className="text-sm text-blue-800">Kilometers</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{route.duration_hours}</div>
            <div className="text-sm text-purple-800">Hours</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 capitalize">{route.transport_mode}</div>
            <div className="text-sm text-orange-800">Transport</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 capitalize">{route.fuel_type}</div>
            <div className="text-sm text-green-800">Fuel Type</div>
          </div>
        </div>
      </div>

      {/* Emissions Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Emissions Analysis</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{emissions.total_co2_kg}</div>
            <div className="text-sm text-red-800">Total CO₂ (kg)</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{emissions.co2_per_km}</div>
            <div className="text-sm text-yellow-800">CO₂ per km</div>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{emissions.fuel_consumed_liters}</div>
            <div className="text-sm text-indigo-800">Fuel (Liters)</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${emissions.fuel_cost_estimate}</div>
            <div className="text-sm text-green-800">Fuel Cost</div>
          </div>
        </div>
      </div>

      {/* Environmental Impact Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <TreePine className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Environmental Impact</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Eco Score</span>
              <span className="text-2xl font-bold text-green-600">{environmental_impact.eco_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${environmental_impact.eco_score}%` }}
              ></div>
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-800">
              {environmental_impact.comparison?.rating || 'Good Choice'}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Trees to Offset</span>
              <span className="text-xl font-bold text-green-600">{environmental_impact.trees_to_offset}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="mb-1"><strong>vs Average Truck:</strong> {environmental_impact.comparison?.vs_average_truck}</div>
              <div><strong>vs Air Freight:</strong> {environmental_impact.comparison?.vs_air_freight}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Map Component with Leaflet
const InteractiveMap = ({ routeData, formData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!window.L || mapInstanceRef.current) return;

      mapInstanceRef.current = window.L.map(mapRef.current).setView([28.6139, 77.2090], 10);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(mapInstanceRef.current);

      updateMapMarkers();
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when form data changes
  useEffect(() => {
    if (mapInstanceRef.current && formData) {
      updateMapMarkers();
    }
  }, [formData]);

  // Update route when route data changes
  useEffect(() => {
    if (mapInstanceRef.current && routeData && routeData.success) {
      updateMapWithRoute(routeData.route);
    }
  }, [routeData]);

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L || !formData) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    const { origin_lat, origin_lng, destination_lat, destination_lng } = formData;

    if (!isNaN(origin_lat) && !isNaN(origin_lng)) {
      const originMarker = window.L.marker([origin_lat, origin_lng])
        .addTo(mapInstanceRef.current)
        .bindPopup('📍 Origin')
        .openPopup();
      markersRef.current.push(originMarker);
    }

    if (!isNaN(destination_lat) && !isNaN(destination_lng)) {
      const destMarker = window.L.marker([destination_lat, destination_lng])
        .addTo(mapInstanceRef.current)
        .bindPopup('🎯 Destination');
      markersRef.current.push(destMarker);
    }

    // Fit map to show both markers
    if (!isNaN(origin_lat) && !isNaN(origin_lng) && !isNaN(destination_lat) && !isNaN(destination_lng)) {
      const group = new window.L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const updateMapWithRoute = (route) => {
    if (!mapInstanceRef.current || !window.L || !route.geometry) return;

    // Clear existing route
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }

    // Convert geometry to LatLng format
    const latlngs = route.geometry.map(coord => [coord[1], coord[0]]);

    // Add route line
    routeLayerRef.current = window.L.polyline(latlngs, {
      color: '#10b981',
      weight: 4,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);

    // Clear and add markers with route info
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    const originMarker = window.L.marker([route.origin.lat, route.origin.lng])
      .addTo(mapInstanceRef.current)
      .bindPopup(`📍 Origin<br>Distance: ${route.distance_km} km`);

    const destMarker = window.L.marker([route.destination.lat, route.destination.lng])
      .addTo(mapInstanceRef.current)
      .bindPopup(`🎯 Destination<br>Duration: ${route.duration_hours} hours`);

    markersRef.current.push(originMarker, destMarker);

    // Fit map to route
    const group = new window.L.featureGroup([routeLayerRef.current, ...markersRef.current]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  };

  if (!routeData || !routeData.success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Route Map</h3>
        </div>
        
        <div 
          ref={mapRef} 
          className="h-96 bg-gray-100 rounded-lg"
          style={{ minHeight: '400px' }}
        />
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Interactive map showing current coordinates. Calculate a route to see the path.
        </div>
      </div>
    );
  }

  const { route } = routeData;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <MapPin className="w-6 h-6 text-green-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Route Map</h3>
      </div>
      
      <div 
        ref={mapRef} 
        className="h-96 bg-gray-100 rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="font-semibold text-blue-600">📍 Origin</div>
          <div className="text-gray-600">{route.origin.lat.toFixed(4)}, {route.origin.lng.toFixed(4)}</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="font-semibold text-green-600">🎯 Destination</div>
          <div className="text-gray-600">{route.destination.lat.toFixed(4)}, {route.destination.lng.toFixed(4)}</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <div className="font-semibold text-purple-600">📏 Distance</div>
          <div className="text-gray-600">{route.distance_km} km</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="font-semibold text-orange-600">⏱️ Duration</div>
          <div className="text-gray-600">{route.duration_hours} hours</div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const EcoRouteDashboard = () => {
  const [routeData, setRouteData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      await apiService.getHealth();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const handleRouteCalculated = (data) => {
    setRouteData(data);
  };

  const handleFormDataChange = (data) => {
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Leaf className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">coRoute AI</h1>
                <p className="text-sm text-gray-600">Smart Logistics • Zero Emissions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                apiStatus === 'connected' ? 'bg-green-100 text-green-800' : 
                apiStatus === 'disconnected' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'connected' ? 'bg-green-500' : 
                  apiStatus === 'disconnected' ? 'bg-red-500' : 
                  'bg-yellow-500'
                }`}></div>
                API {apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Route Calculator */}
          <div className="lg:col-span-1">
            <RouteCalculator 
              onRouteCalculated={handleRouteCalculated} 
              onFormDataChange={handleFormDataChange}
            />
          </div>
          
          {/* Right Column - Map and Results */}
          <div className="lg:col-span-2 space-y-8">
            <InteractiveMap routeData={routeData} formData={formData} />
            <RouteResults routeData={routeData} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-green-400 mr-2" />
            <span className="text-lg font-semibold">coRoute AI</span>
          </div>
          <p className="text-gray-400">Building sustainable logistics solutions for a greener future</p>
        </div>
      </footer>
    </div>
  );
};

export default EcoRouteDashboard;