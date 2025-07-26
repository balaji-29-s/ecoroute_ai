from sqlalchemy import Column, Integer, String, Float, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Route(BaseModel):
    __tablename__ = "routes"
    
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    
    distance_km = Column(Float, nullable=False)
    duration_hours = Column(Float, nullable=False)
    transport_mode = Column(String(50), nullable=False)
    fuel_type = Column(String(50), nullable=False)
    cargo_weight_kg = Column(Integer, default=0)
    
    # Emissions data
    total_co2_kg = Column(Float, nullable=False)
    co2_per_km = Column(Float, nullable=False)
    fuel_consumed_liters = Column(Float, nullable=False)
    fuel_cost_estimate = Column(Float, nullable=False)
    eco_score = Column(Float, nullable=False)
    
    # Route geometry and metadata
    geometry = Column(JSON, nullable=True)
    weather_conditions = Column(JSON, nullable=True)
    
    # Optional organization reference
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    organization = relationship("Organization", back_populates="routes")
    
    def __repr__(self):
        return f"<Route(distance={self.distance_km}km, mode='{self.transport_mode}')>"