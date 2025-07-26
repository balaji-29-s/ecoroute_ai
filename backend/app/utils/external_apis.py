import logging
from typing import Dict, Tuple
from math import radians, cos, sin, asin, sqrt

logger = logging.getLogger(__name__)

class ExternalAPIClient:
    """Client for external APIs (routing, weather, etc.)"""
    
    def __init__(self):
        self.timeout = 30.0
        
    async def get_route_data(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float],
        transport_mode: str = "driving"
    ) -> Dict:
        """Get route data - using mock data for now"""
        
        try:
            distance_km = self._calculate_distance(origin, destination)
            duration_seconds = self._calculate_duration(origin, destination, transport_mode)
            
            # Create mock response similar to OpenRouteService format
            mock_response = {
                "features": [{
                    "properties": {
                        "summary": {
                            "distance": distance_km * 1000,  # Convert to meters
                            "duration": duration_seconds
                        }
                    },
                    "geometry": {
                        "coordinates": [
                            [origin[1], origin[0]],  # [lng, lat]
                            [(origin[1] + destination[1])/2, (origin[0] + destination[0])/2],
                            [destination[1], destination[0]]
                        ]
                    }
                }]
            }
            
            logger.info(f"Route calculated: {distance_km:.2f}km, {duration_seconds/3600:.2f}h")
            return mock_response
            
        except Exception as e:
            logger.error(f"Error getting route data: {e}")
            return self._get_fallback_route(origin, destination)
    
    async def get_weather_data(self, lat: float, lng: float) -> Dict:
        """Get weather data for a location - mock data for now"""
        
        try:
            # Mock weather data (in production, use OpenWeatherMap API)
            mock_weather = {
                "temperature": 22.5,
                "humidity": 68,
                "wind_speed": 15.2,
                "wind_direction": 180,
                "weather_main": "Clear",
                "visibility": 10000,
                "pressure": 1013.25
            }
            
            logger.info(f"Weather data retrieved for ({lat:.2f}, {lng:.2f})")
            return mock_weather
            
        except Exception as e:
            logger.error(f"Error getting weather data: {e}")
            return {"error": str(e)}
    
    def _calculate_distance(self, origin: Tuple[float, float], dest: Tuple[float, float]) -> float:
        """Calculate distance using Haversine formula"""
        lat1, lng1 = radians(origin[0]), radians(origin[1])
        lat2, lng2 = radians(dest[0]), radians(dest[1])
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        distance_km = 2 * asin(sqrt(a)) * 6371  # Earth's radius
        
        return distance_km
    
    def _calculate_duration(self, origin: Tuple[float, float], dest: Tuple[float, float], mode: str) -> float:
        """Calculate estimated duration"""
        distance = self._calculate_distance(origin, dest)
        
        # Average speeds by transport mode (km/h)
        speeds = {"truck": 70, "car": 80, "ship": 25, "train": 60}
        speed = speeds.get(mode, 70)
        duration_hours = distance / speed
        
        return duration_hours * 3600  # Return in seconds
    
    def _get_fallback_route(self, origin: Tuple[float, float], dest: Tuple[float, float]) -> Dict:
        """Fallback route data when API fails"""
        return {
            "features": [{
                "properties": {
                    "summary": {
                        "distance": self._calculate_distance(origin, dest) * 1000,
                        "duration": self._calculate_duration(origin, dest, "truck")
                    }
                },
                "geometry": {
                    "coordinates": [[origin[1], origin[0]], [dest[1], dest[0]]]
                }
            }]
        }

# Global client instance
api_client = ExternalAPIClient()