from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Vehicle(BaseModel):
    __tablename__ = "vehicles"
    
    name = Column(String(255), nullable=False)
    vehicle_type = Column(String(100), nullable=False)  # truck, ship, train, etc.
    fuel_type = Column(String(50), nullable=False)  # diesel, electric, lng, etc.
    
    # Vehicle specifications
    max_cargo_kg = Column(Integer, nullable=False)
    fuel_efficiency_km_per_liter = Column(Float, nullable=False)
    co2_emission_factor_kg_per_liter = Column(Float, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    current_location_lat = Column(Float, nullable=True)
    current_location_lng = Column(Float, nullable=True)
    
    # Optional organization reference
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    organization = relationship("Organization", back_populates="vehicles")
    
    def __repr__(self):
        return f"<Vehicle(name='{self.name}', type='{self.vehicle_type}')>"