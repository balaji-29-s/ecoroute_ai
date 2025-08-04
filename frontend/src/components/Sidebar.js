import React from 'react';

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

export default function Sidebar({ route, routes, onRouteSelect }) {
  // Format distance with more precision for short routes
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(3)} km`;
  };
  
  // Format CO2 with appropriate units
  const formatCO2 = (kg) => {
    if (kg < 0.001) {
      return `${(kg * 1000000).toFixed(1)} mg`;
    } else if (kg < 1) {
      return `${(kg * 1000).toFixed(1)} g`;
    }
    return `${kg.toFixed(4)} kg`;
  };
  
  // Format time
  const formatTime = (hours) => {
    if (hours < 1) {
      return `${(hours * 60).toFixed(0)} min`;
    }
    return `${hours.toFixed(2)} hr`;
  };

  // Get eco score color
  const getEcoScoreColor = (score) => {
    switch (score) {
      case 'A+': return '#059669';
      case 'A': return '#10b981';
      case 'B': return '#84cc16';
      case 'C': return '#eab308';
      case 'D': return '#f97316';
      case 'E': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get eco score background
  const getEcoScoreBg = (score) => {
    switch (score) {
      case 'A+': return '#dcfce7';
      case 'A': return '#dcfce7';
      case 'B': return '#f7fee7';
      case 'C': return '#fefce8';
      case 'D': return '#fff7ed';
      case 'E': return '#fef2f2';
      default: return '#f3f4f6';
    }
  };

  return (
    <div className="h-full d-flex flex-column">
      {/* Header */}
      <div className="card mb-0 rounded-0">
        <div className="card-header">
          <h3 className="mb-0">Route Details</h3>
        </div>
      </div>

      {/* Route Selection */}
      {routes.length > 0 && (
        <div className="card mx-3 mt-3">
          <div className="card-header">
            <h4 className="mb-0">Available Routes</h4>
          </div>
          <div className="card-body p-0">
            {routes.map((routeOption, index) => (
              <div
                key={index}
                className={`p-3 cursor-pointer transition-all ${
                  route && route.type === routeOption.type ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => onRouteSelect(routeOption)}
                style={{
                  borderBottom: index < routes.length - 1 ? '1px solid var(--border-color)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div className="d-flex align-center justify-between mb-2">
                  <div className="d-flex align-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ROUTE_COLORS[routeOption.type] }}
                    ></div>
                    <span className="font-semibold">{ROUTE_NAMES[routeOption.type]}</span>
                  </div>
                  <div 
                    className="badge"
                    style={{ 
                      backgroundColor: getEcoScoreBg(routeOption.eco_score),
                      color: getEcoScoreColor(routeOption.eco_score)
                    }}
                  >
                    {routeOption.eco_score}
                  </div>
                </div>
                
                <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                  <div className="text-sm">
                    <span className="text-gray-500">Distance:</span>
                    <br />
                    <span className="font-medium">{formatDistance(routeOption.distance_km)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <br />
                    <span className="font-medium">{formatTime(routeOption.duration_hr)}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">CO₂:</span>
                  <span className="font-medium ml-1">{formatCO2(routeOption.emissions.total_kg)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Details */}
      {route ? (
        <div className="flex-1 overflow-auto">
          <div className="card mx-3 mt-3">
            <div className="card-header">
              <div className="d-flex align-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: ROUTE_COLORS[route.type] }}
                ></div>
                <h4 className="mb-0">{ROUTE_NAMES[route.type]} Route</h4>
              </div>
            </div>
            
            <div className="card-body">
              {/* Route Information */}
              <div className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">📊 Route Information</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Distance</div>
                      <div className="text-lg font-semibold">{formatDistance(route.distance_km)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Duration</div>
                      <div className="text-lg font-semibold">{formatTime(route.duration_hr)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Avg Speed</div>
                      <div className="text-lg font-semibold">{(route.distance_km / route.duration_hr).toFixed(1)} km/h</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Eco Score</div>
                      <div 
                        className="text-lg font-semibold"
                        style={{ color: getEcoScoreColor(route.eco_score) }}
                      >
                        {route.eco_score}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">🌱 Environmental Impact</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-between align-center mb-1">
                      <span className="text-sm text-gray-500">CO₂ Emissions</span>
                      <span className="font-semibold">{formatCO2(route.emissions.total_kg)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((route.emissions.total_kg / 0.1) * 100, 100)}%`,
                          backgroundColor: route.emissions.total_kg < 0.01 ? '#10b981' : 
                                         route.emissions.total_kg < 0.05 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">CO₂ per km</div>
                      <div className="font-semibold">{route.emissions.per_km.toFixed(1)} g/km</div>
                    </div>
                    {route.emissions.fuel_consumed_liters > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Fuel Used</div>
                        <div className="font-semibold">{route.emissions.fuel_consumed_liters.toFixed(2)} L</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Impact Factors */}
              <div className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">⚡ Impact Factors</h5>
                </div>
                <div className="card-body">
                  <div className="space-y-2">
                    {route.emissions.traffic_impact !== 0 && (
                      <div className="d-flex justify-between">
                        <span className="text-sm">Traffic Impact</span>
                        <span className={`font-medium ${route.emissions.traffic_impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {route.emissions.traffic_impact > 0 ? '+' : ''}{route.emissions.traffic_impact}%
                        </span>
                      </div>
                    )}
                    {route.emissions.weather_impact !== 0 && (
                      <div className="d-flex justify-between">
                        <span className="text-sm">Weather Impact</span>
                        <span className={`font-medium ${route.emissions.weather_impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {route.emissions.weather_impact > 0 ? '+' : ''}{route.emissions.weather_impact}%
                        </span>
                      </div>
                    )}
                    {route.emissions.cargo_impact !== 0 && (
                      <div className="d-flex justify-between">
                        <span className="text-sm">Cargo Impact</span>
                        <span className="font-medium text-red-600">+{route.emissions.cargo_impact}%</span>
                      </div>
                    )}
                    <div className="d-flex justify-between">
                      <span className="text-sm">Temperature</span>
                      <span className="font-medium">{route.weather.temperature}°C</span>
                    </div>
                    <div className="d-flex justify-between">
                      <span className="text-sm">Conditions</span>
                      <span className="font-medium">{route.weather.description}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Turn-by-turn Directions */}
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">🧭 Turn-by-turn Directions</h5>
                </div>
                <div className="card-body">
                  <div className="max-h-64 overflow-y-auto">
                    <ol className="space-y-2">
                      {route.instructions.map((step, idx) => (
                        <li key={idx} className="text-sm leading-relaxed">
                          <span className="font-medium text-gray-500 mr-2">{idx + 1}.</span>
                          {step.instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 d-flex align-center justify-center">
          <div className="text-center p-4">
            <div className="text-6xl mb-4">🗺️</div>
            <h4 className="mb-2">No Route Selected</h4>
            <p className="text-gray-500">
              {routes.length > 0 
                ? "Click on a route above to see detailed information."
                : "Calculate a route to see detailed information here."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}