import logging
from typing import Dict, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class EmissionResult:
    """Result of carbon emission calculation"""
    total_co2_kg: float
    co2_per_km: float
    fuel_consumed_liters: float
    fuel_cost_estimate: float
    confidence_score: float

class CarbonEmissionCalculator:
    """Calculate carbon emissions for different transport modes"""
    
    def __init__(self):
        # Base emission factors (kg CO2 per km)
        self.emission_factors = {
            "truck": {"diesel": 0.95, "electric": 0.12, "hybrid": 0.45},
            "ship": {"diesel": 2.1, "lng": 1.8, "electric": 0.3},
            "train": {"diesel": 0.35, "electric": 0.08},
            "plane": {"jet_fuel": 3.15}
        }
        
        # Fuel consumption rates (L/100km)
        self.fuel_consumption = {
            "truck": {"diesel": 35.0, "hybrid": 28.0},
            "ship": {"diesel": 180.0, "lng": 160.0},
            "train": {"diesel": 25.0},
            "plane": {"jet_fuel": 450.0}
        }
        
        # Fuel prices (per liter)
        self.fuel_prices = {
            "diesel": 1.45, "lng": 1.20, "electric": 0.15, "jet_fuel": 1.80
        }
    
    def calculate_emissions(
        self,
        distance_km: float,
        transport_mode: str,
        fuel_type: str,
        cargo_weight_kg: int = 0,
        weather_conditions: Optional[Dict] = None
    ) -> EmissionResult:
        """Calculate total emissions for a route"""
        
        try:
            # Get base emission factor
            base_factor = self.emission_factors.get(transport_mode, {}).get(fuel_type, 1.0)
            
            # Calculate load impact (more cargo = more emissions)
            load_multiplier = self._calculate_load_impact(cargo_weight_kg, transport_mode)
            
            # Calculate weather impact
            weather_multiplier = self._calculate_weather_impact(weather_conditions, transport_mode)
            
            # Total emission factor
            total_factor = base_factor * load_multiplier * weather_multiplier
            
            # Calculate total CO2
            total_co2_kg = distance_km * total_factor
            
            # Calculate fuel consumption
            base_consumption = self.fuel_consumption.get(transport_mode, {}).get(fuel_type, 35.0)
            fuel_consumed = (distance_km / 100) * base_consumption * load_multiplier * weather_multiplier
            
            # Calculate fuel cost
            fuel_price = self.fuel_prices.get(fuel_type, 1.50)
            fuel_cost = fuel_consumed * fuel_price
            
            # Calculate confidence score
            confidence = 85.0  # Base confidence
            if not weather_conditions:
                confidence -= 10
            
            return EmissionResult(
                total_co2_kg=round(total_co2_kg, 4),
                co2_per_km=round(total_factor, 4),
                fuel_consumed_liters=round(fuel_consumed, 2),
                fuel_cost_estimate=round(fuel_cost, 2),
                confidence_score=confidence
            )
            
        except Exception as e:
            logger.error(f"Error calculating emissions: {e}")
            # Return fallback calculation
            return EmissionResult(
                total_co2_kg=distance_km * 1.0,
                co2_per_km=1.0,
                fuel_consumed_liters=distance_km * 0.35,
                fuel_cost_estimate=distance_km * 0.50,
                confidence_score=50.0
            )
    
    def _calculate_load_impact(self, cargo_weight_kg: int, transport_mode: str) -> float:
        """Calculate how cargo weight affects emissions"""
        if cargo_weight_kg <= 0:
            return 1.0
        
        # Load impact factors
        load_factors = {
            "truck": 0.15,    # 15% increase per ton
            "ship": 0.02,     # 2% increase per ton 
            "train": 0.05,    # 5% increase per ton
            "plane": 0.25     # 25% increase per ton
        }
        
        factor = load_factors.get(transport_mode, 0.10)
        cargo_tons = cargo_weight_kg / 1000
        
        # Cap the impact to avoid unrealistic multipliers
        impact = min(1.0 + (cargo_tons * factor), 3.0)
        return impact
    
    def _calculate_weather_impact(self, weather: Optional[Dict], transport_mode: str) -> float:
        """Calculate how weather affects emissions"""
        if not weather:
            return 1.0
        
        multiplier = 1.0
        
        # Wind impact (mainly for ships and planes)
        if transport_mode in ["ship", "plane"] and "wind_speed" in weather:
            wind_speed = weather["wind_speed"]
            if wind_speed > 20:
                multiplier *= 1.15
            elif wind_speed > 35:
                multiplier *= 1.30
        
        # Temperature impact
        if "temperature" in weather:
            temp = weather["temperature"]
            if temp < -10 or temp > 35:
                multiplier *= 1.10
        
        return min(multiplier, 2.0)

# Global calculator instance
emission_calculator = CarbonEmissionCalculator()