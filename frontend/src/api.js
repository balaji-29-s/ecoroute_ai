export async function fetchRoutes(origin, destination, mode, vehicleType, trafficCondition, cargoWeight) {
  const res = await fetch('http://localhost:8000/api/routes/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      origin, 
      destination, 
      mode, 
      vehicle_type: vehicleType,
      traffic_condition: trafficCondition,
      cargo_weight_kg: cargoWeight
    })
  });
  return await res.json();
}

// WARNING: For production, proxy this call through your backend to hide your API key!
export async function geocodePlace(place) {
  const apiKey = 'YOUR_ORS_API_KEY'; // <-- Replace with your ORS API key or proxy endpoint
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(place)}&size=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.features && data.features.length > 0) {
    // [lat, lng]
    return data.features[0].geometry.coordinates.reverse();
  }
  throw new Error('Location not found');
}
