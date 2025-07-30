import React from 'react';

export default function Sidebar({ route }) {
  if (!route) return <div style={{padding: 20}}>Click a route to see details.</div>;
  
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
  
  return (
    <div style={{padding: 20}}>
      <h2 style={{color: route.type === 'eco' ? 'green' : route.type === 'fastest' ? 'blue' : 'gray'}}>
        {route.type.toUpperCase()} Route
      </h2>
      
      <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
        <h3>Route Information</h3>
        <p><b>Distance:</b> {formatDistance(route.distance_km)}</p>
        <p><b>Duration:</b> {formatTime(route.duration_hr)}</p>
        <p><b>Average Speed:</b> {(route.distance_km / route.duration_hr).toFixed(1)} km/h</p>
      </div>
      
      <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px'}}>
        <h3>Environmental Impact</h3>
        <p><b>CO₂ Emissions:</b> {formatCO2(route.emissions.total_kg)}</p>
        <p><b>CO₂ per km:</b> {route.emissions.per_km.toFixed(1)} g/km</p>
        <p><b>Eco Score:</b> <span style={{
          color: route.eco_score === 'A+' ? '#2E8B57' : 
                 route.eco_score === 'A' ? '#3CB371' :
                 route.eco_score === 'B' ? '#90EE90' :
                 route.eco_score === 'C' ? '#FFD700' :
                 route.eco_score === 'D' ? '#FFA500' :
                 route.eco_score === 'E' ? '#FF6347' : '#FF0000',
          fontWeight: 'bold'
        }}>{route.eco_score}</span></p>
        {route.emissions.fuel_consumed_liters > 0 && (
          <p><b>Fuel Consumption:</b> {route.emissions.fuel_consumed_liters.toFixed(2)} L</p>
        )}
      </div>
      
      <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#e6f3ff', borderRadius: '5px'}}>
        <h3>Impact Factors</h3>
        {route.emissions.traffic_impact !== 0 && (
          <p><b>Traffic Impact:</b> {route.emissions.traffic_impact > 0 ? '+' : ''}{route.emissions.traffic_impact}%</p>
        )}
        {route.emissions.weather_impact !== 0 && (
          <p><b>Weather Impact:</b> {route.emissions.weather_impact > 0 ? '+' : ''}{route.emissions.weather_impact}%</p>
        )}
        {route.emissions.cargo_impact !== 0 && (
          <p><b>Cargo Impact:</b> +{route.emissions.cargo_impact}%</p>
        )}
        <p><b>Temperature:</b> {route.weather.temperature}°C ({route.weather.description})</p>
      </div>
      
      <div style={{marginBottom: '20px'}}>
        <h3>Turn-by-turn Directions</h3>
        <ol style={{maxHeight: '200px', overflowY: 'auto', paddingLeft: '20px'}}>
          {route.instructions.map((step, idx) => (
            <li key={idx} style={{marginBottom: '5px'}}>{step.instruction}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}