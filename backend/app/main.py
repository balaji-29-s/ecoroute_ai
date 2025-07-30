from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from app.utils.external_apis import fetch_routes, fetch_weather
from app.core.emissions import calculate_emissions, eco_score, classify_route_by_emissions

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    origin: List[float]  # [lat, lng]
    destination: List[float]  # [lat, lng]
    mode: str = "car"
    vehicle_type: Optional[str] = "petrol"  # petrol, diesel, hybrid, electric, etc.
    traffic_condition: Optional[str] = "normal"  # highway, urban, rural, congested
    cargo_weight_kg: Optional[int] = 0

@app.get("/")
def root():
    return {"status": "ok", "message": "EcoRoute backend running."}

@app.post("/api/routes/calculate")
async def calculate_routes(req: RouteRequest):
    try:
        logger.info(f"Route calculation request: origin={req.origin}, destination={req.destination}, mode={req.mode}, vehicle={req.vehicle_type}")
        
        features = await fetch_routes(tuple(req.origin), tuple(req.destination), req.mode)
        weather = await fetch_weather(req.origin[0], req.origin[1])
        
        # Determine weather condition for emissions calculation
        weather_condition = "normal"
        if weather.get("description", "").lower() in ["rain", "drizzle", "shower"]:
            weather_condition = "rain"
        elif weather.get("description", "").lower() in ["snow", "sleet"]:
            weather_condition = "snow"
        
        routes = []
        
        for idx, feat in enumerate(features):
            summary = feat["properties"]["summary"]
            geometry = feat["geometry"]["coordinates"]
            steps = []
            segments = feat["properties"].get("segments", [])
            if segments and "steps" in segments[0]:
                steps = segments[0]["steps"]
            
            distance_km = summary["distance"] / 1000
            duration_hr = summary["duration"] / 3600
            
            # Calculate precise emissions with all factors
            emissions = calculate_emissions(
                distance_km=distance_km,
                mode=req.mode,
                vehicle_type=req.vehicle_type,
                traffic_condition=req.traffic_condition,
                weather=weather_condition,
                cargo_weight_kg=req.cargo_weight_kg
            )
            
            route_data = {
                "distance_km": round(distance_km, 3),
                "duration_hr": round(duration_hr, 3),
                "geometry": geometry,
                "instructions": steps,
                "emissions": emissions,
                "eco_score": eco_score(emissions["total_g"]),
                "weather": weather
            }
            routes.append(route_data)
            
            # Debug logging for emissions
            logger.info(f"Route {idx+1} - Distance: {distance_km:.4f}km, Mode: {req.mode}, Vehicle: {req.vehicle_type}")
            logger.info(f"Route {idx+1} - Emissions: {emissions['total_g']:.1f}g ({emissions['total_kg']:.4f}kg), Eco Score: {eco_score(emissions['total_g'])}")
        
        # Classify routes based on emissions and time
        route_types = classify_route_by_emissions(routes)
        
        # Assign route types
        for idx, route in enumerate(routes):
            route["type"] = route_types[idx] if idx < len(route_types) else "alternate"
            logger.info(f"Route {idx+1}: {route['type']} - {route['distance_km']:.3f}km, {route['duration_hr']:.3f}h, CO2: {route['emissions']['total_kg']:.4f}kg, Score: {route['eco_score']}")
        
        logger.info(f"Successfully calculated {len(routes)} routes")
        return {"success": True, "routes": routes}
        
    except Exception as e:
        logger.error(f"Route calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))