from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import logging

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our modules with error handling
try:
    from app.config import settings
except ImportError:
    logger.warning("Config module not found, using defaults")
    class DefaultSettings:
        app_name = "Logistics Route Optimization API"
        app_version = "1.0.0"
    settings = DefaultSettings()

try:
    from app.database import get_db, test_db_connection, engine, Base
except ImportError:
    logger.error("Database module not found - creating basic setup")
    from sqlalchemy import create_engine
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    
    # Basic database setup
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    def test_db_connection():
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False

# Import models with error handling
try:
    from app.models import route, vehicle
    logger.info("✅ Models imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Models import failed: {e}")
    logger.info("Continuing without models - basic functionality will work")

# Pydantic models for request/response validation
class RouteRequest(BaseModel):
    origin_lat: float = Field(..., ge=-90, le=90, description="Origin latitude")
    origin_lng: float = Field(..., ge=-180, le=180, description="Origin longitude")
    destination_lat: float = Field(..., ge=-90, le=90, description="Destination latitude")
    destination_lng: float = Field(..., ge=-180, le=180, description="Destination longitude")
    transport_mode: str = Field(default="truck", description="Transport mode")
    fuel_type: str = Field(default="diesel", description="Fuel type")
    cargo_weight_kg: int = Field(default=0, ge=0, description="Cargo weight in kg")

# CREATE THE FASTAPI APP
app = FastAPI(
    title=settings.app_name,
    description="🌱 AI-powered logistics route optimization for minimal carbon emissions",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Run when the application starts"""
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")
        
        # Test database connection
        if test_db_connection():
            logger.info("✅ Database connection successful")
        else:
            logger.warning("⚠️ Database connection failed")
            
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        
    logger.info("✅ Application startup completed")

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": f"Welcome to {settings.app_name}! 🌱",
        "version": settings.app_version,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "test_db": "/api/test/organizations"
        }
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version
    }
    
    # Test database connection
    try:
        result = db.execute(text("SELECT 1 as test"))
        test_result = result.fetchone()[0]
        health_status["database"] = {
            "status": "connected",
            "test_query": "passed" if test_result == 1 else "failed"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["database"] = {
            "status": "disconnected",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    return health_status

@app.get("/api/test/organizations")
async def get_test_organizations(db: Session = Depends(get_db)):
    """Test endpoint to verify database data"""
    try:
        # Try to query organizations table if it exists
        try:
            result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='organizations'"))
            table_exists = result.fetchone() is not None
            
            if table_exists:
                result = db.execute(text("SELECT id, name, type, contact_email FROM organizations LIMIT 10"))
                organizations = []
                
                for row in result:
                    organizations.append({
                        "id": str(row[0]),
                        "name": row[1],
                        "type": row[2],
                        "contact_email": row[3]
                    })
                
                return {
                    "success": True,
                    "count": len(organizations),
                    "organizations": organizations,
                    "message": "Organizations table found and queried"
                }
            else:
                return {
                    "success": True,
                    "count": 0,
                    "organizations": [],
                    "message": "Organizations table does not exist yet - this is normal for a fresh installation"
                }
                
        except Exception as query_error:
            logger.info(f"Organizations table query failed: {query_error}")
            return {
                "success": True,
                "count": 0,
                "organizations": [],
                "message": "Database is working but organizations table is not available"
            }
        
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "organizations": [],
            "message": "Database connection test failed"
        }

@app.post("/api/routes/calculate")
async def calculate_route(route_request: RouteRequest, db: Session = Depends(get_db)):
    """
    Calculate optimal route with carbon emissions
    
    Note: This is a demo version that returns mock data since external APIs are not configured.
    """
    
    try:
        logger.info(f"Calculating route: ({route_request.origin_lat}, {route_request.origin_lng}) -> ({route_request.destination_lat}, {route_request.destination_lng})")
        
        # Mock calculations (replace with actual API calls when available)
        import math
        
        # Calculate approximate distance using Haversine formula
        lat1, lon1 = math.radians(route_request.origin_lat), math.radians(route_request.origin_lng)
        lat2, lon2 = math.radians(route_request.destination_lat), math.radians(route_request.destination_lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance_km = 6371 * c  # Earth's radius in km
        
        # Mock emission calculations
        fuel_efficiency = {"diesel": 3.5, "electric": 0, "lng": 4.2}.get(route_request.fuel_type, 3.5)
        co2_factor = {"diesel": 2.68, "electric": 0.5, "lng": 2.1}.get(route_request.fuel_type, 2.68)
        
        fuel_consumed = distance_km / fuel_efficiency if fuel_efficiency > 0 else distance_km * 0.2
        total_co2 = fuel_consumed * co2_factor
        cargo_multiplier = 1 + (route_request.cargo_weight_kg / 10000)  # 10% increase per 10 tons
        total_co2 *= cargo_multiplier
        
        duration_hours = distance_km / 70  # Assume 70 km/h average speed
        eco_score = max(0, 100 - (total_co2 / distance_km * 50))
        
        response_data = {
            "success": True,
            "route": {
                "origin": {"lat": route_request.origin_lat, "lng": route_request.origin_lng},
                "destination": {"lat": route_request.destination_lat, "lng": route_request.destination_lng},
                "distance_km": round(distance_km, 2),
                "duration_hours": round(duration_hours, 2),
                "transport_mode": route_request.transport_mode,
                "fuel_type": route_request.fuel_type,
                "cargo_weight_kg": route_request.cargo_weight_kg,
                "geometry": [[route_request.origin_lng, route_request.origin_lat], [route_request.destination_lng, route_request.destination_lat]]
            },
            "emissions": {
                "total_co2_kg": round(total_co2, 3),
                "co2_per_km": round(total_co2 / distance_km, 3),
                "fuel_consumed_liters": round(fuel_consumed, 2),
                "fuel_cost_estimate": round(fuel_consumed * 1.5, 2),  # Assume $1.5 per liter
                "confidence_score": 0.75  # Mock confidence
            },
            "environmental_impact": {
                "eco_score": round(eco_score, 1),
                "trees_to_offset": round(total_co2 / 21.77, 1),
                "comparison": {
                    "vs_average_truck": f"{round((2.5 - total_co2/distance_km) / 2.5 * 100, 1)}% better",
                    "vs_air_freight": "75% less emissions",
                    "rating": "🌱 Eco-Friendly" if eco_score > 70 else "⚠️ Moderate" if eco_score > 40 else "🚨 High Impact"
                }
            },
            "weather_conditions": {
                "temperature": 22.5,
                "humidity": 65,
                "wind_speed": 8.2,
                "conditions": "clear"
            },
            "timestamp": datetime.utcnow().isoformat(),
            "note": "This is demo data. Configure external APIs for real calculations."
        }
        
        return response_data
        
    except Exception as e:
        logger.error(f"Route calculation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Route calculation failed: {str(e)}")

# This is important - the app object must be available at module level
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )