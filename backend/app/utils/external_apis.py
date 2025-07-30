import os
import httpx
import logging
from dotenv import load_dotenv

# Load .env from the app directory specifically
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
logger = logging.getLogger(__name__)

ORS_API_KEY = os.getenv("ORS_API_KEY")
OWM_API_KEY = os.getenv("OWM_API_KEY")

# Add debug logging to check if keys are loaded
logger.info(f"ORS_API_KEY loaded: {'Yes' if ORS_API_KEY else 'No'}")
logger.info(f"OWM_API_KEY loaded: {'Yes' if OWM_API_KEY else 'No'}")

def get_profile(mode):
    return {
        "car": "driving-car",
        "bike": "cycling-regular",
        "truck": "driving-hgv"
    }.get(mode, "driving-car")

async def fetch_routes(origin, destination, mode):
    if not ORS_API_KEY:
        logger.error("ORS_API_KEY not set in environment variables")
        raise Exception("ORS_API_KEY not set in environment variables.")
    
    profile = get_profile(mode)
    url = f"https://api.openrouteservice.org/v2/directions/{profile}/geojson"
    headers = {"Authorization": ORS_API_KEY}
    body = {
        "coordinates": [
            [origin[1], origin[0]],
            [destination[1], destination[0]]
        ],
        "instructions": True,
        "alternative_routes": {
            "share_factor": 0.6,
            "target_count": 3
        }
    }
    
    logger.info(f"Fetching routes from ORS: {url}")
    logger.info(f"Request body: {body}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()
            logger.info(f"ORS response received with {len(data.get('features', []))} routes")
            return data["features"]
    except httpx.HTTPStatusError as e:
        logger.error(f"ORS API error: {e.response.status_code} - {e.response.text}")
        raise Exception(f"ORS API error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        logger.error(f"Error fetching routes: {e}")
        raise Exception(f"Error fetching routes: {e}")

async def fetch_weather(lat, lng):
    if not OWM_API_KEY:
        logger.warning("OWM_API_KEY not set, returning mock weather data")
        return {"temperature": 22.5, "description": "No API key"}
    
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OWM_API_KEY}&units=metric"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            logger.info(f"Weather data received for ({lat}, {lng})")
            return {
                "temperature": data["main"]["temp"],
                "description": data["weather"][0]["description"]
            }
    except Exception as e:
        logger.warning(f"Weather API error: {e}, returning mock data")
        return {"temperature": 22.5, "description": "Unavailable"}