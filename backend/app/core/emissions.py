import math

# Comprehensive CO₂ emission factors (g/km) based on real-world data
EMISSION_FACTORS = {
    "car": {
        "petrol": 170,      # Average petrol car
        "diesel": 180,      # Average diesel car
        "hybrid": 100,      # Hybrid vehicle
        "electric": 50,     # Electric car (grid emissions)
        "suv": 220,         # SUV
        "compact": 140      # Compact car
    },
    "bike": {
        "electric": 5,      # E-bike (very low)
        "manual": 0         # Human-powered
    },
    "truck": {
        "small": 400,       # Small delivery truck
        "medium": 600,      # Medium truck
        "large": 800,       # Large truck
        "articulated": 1000 # Articulated truck
    },
    "motorcycle": {
        "small": 100,       # Small motorcycle
        "medium": 150,      # Medium motorcycle
        "large": 200        # Large motorcycle
    }
}

# Fuel efficiency factors (L/100km)
FUEL_EFFICIENCY = {
    "car": {"petrol": 7.5, "diesel": 6.5, "hybrid": 5.0, "electric": 0, "suv": 9.0, "compact": 6.0},
    "truck": {"small": 15, "medium": 25, "large": 35, "articulated": 45},
    "motorcycle": {"small": 3.5, "medium": 4.5, "large": 6.0}
}

# Traffic condition multipliers
TRAFFIC_MULTIPLIERS = {
    "highway": 0.8,      # Better efficiency on highways
    "urban": 1.3,        # Stop-and-go traffic
    "rural": 1.0,        # Normal conditions
    "congested": 1.5     # Heavy traffic
}

# Weather impact factors
WEATHER_MULTIPLIERS = {
    "rain": 1.1,         # Slightly higher consumption
    "snow": 1.3,         # Much higher consumption
    "wind": 1.05,        # Minor impact
    "normal": 1.0        # No impact
}

def calculate_emissions(distance_km, mode, vehicle_type="default", traffic_condition="normal", weather="normal", cargo_weight_kg=0):
    """
    Calculate precise CO₂ emissions based on multiple factors.
    
    Args:
        distance_km: Route distance in kilometers
        mode: Transport mode (car, bike, truck, motorcycle)
        vehicle_type: Specific vehicle type (petrol, diesel, hybrid, etc.)
        traffic_condition: Traffic conditions (highway, urban, rural, congested)
        weather: Weather conditions (normal, rain, snow, wind)
        cargo_weight_kg: Cargo weight in kg (affects truck emissions)
    """
    
    # Get base emission factor
    if mode in EMISSION_FACTORS:
        if vehicle_type in EMISSION_FACTORS[mode]:
            base_factor = EMISSION_FACTORS[mode][vehicle_type]
        else:
            # Use default for the mode
            default_types = list(EMISSION_FACTORS[mode].keys())
            base_factor = EMISSION_FACTORS[mode][default_types[0]]
    else:
        base_factor = 192  # Default car emissions
    
    # Apply traffic condition multiplier
    traffic_mult = TRAFFIC_MULTIPLIERS.get(traffic_condition, 1.0)
    
    # Apply weather multiplier
    weather_mult = WEATHER_MULTIPLIERS.get(weather, 1.0)
    
    # Calculate cargo impact for trucks
    cargo_mult = 1.0
    if mode == "truck" and cargo_weight_kg > 0:
        # 1% increase per 100kg of cargo
        cargo_mult = 1.0 + (cargo_weight_kg / 10000)
    
    # Calculate total emissions
    total_g = distance_km * base_factor * traffic_mult * weather_mult * cargo_mult
    
    # Ensure minimum emissions for very short distances
    if mode == "car" and total_g < 10:
        total_g = 10  # Minimum 10g for car trips
    elif mode == "truck" and total_g < 50:
        total_g = 50  # Minimum 50g for truck trips
    elif mode == "motorcycle" and total_g < 5:
        total_g = 5   # Minimum 5g for motorcycle trips
    
    # Calculate fuel consumption
    fuel_consumed = 0
    if mode in FUEL_EFFICIENCY and vehicle_type in FUEL_EFFICIENCY[mode]:
        base_consumption = FUEL_EFFICIENCY[mode][vehicle_type]
        fuel_consumed = (distance_km / 100) * base_consumption * traffic_mult * weather_mult * cargo_mult
    
    return {
        "total_g": round(total_g, 1),
        "total_kg": round(total_g / 1000, 4),
        "per_km": round(base_factor * traffic_mult * weather_mult * cargo_mult, 1),
        "fuel_consumed_liters": round(fuel_consumed, 2),
        "traffic_impact": round((traffic_mult - 1) * 100, 1),
        "weather_impact": round((weather_mult - 1) * 100, 1),
        "cargo_impact": round((cargo_mult - 1) * 100, 1)
    }

def eco_score(total_g):
    """
    Calculate eco-score based on total emissions.
    Lower emissions = better score.
    """
    if total_g < 1000: return "A+"
    if total_g < 2500: return "A"
    if total_g < 5000: return "B"
    if total_g < 10000: return "C"
    if total_g < 20000: return "D"
    if total_g < 50000: return "E"
    return "F"

def classify_route_by_emissions(routes):
    """
    Classify routes as eco, fastest, or alternate based on emissions and distance.
    Returns route types in order: [eco, fastest, alternate]
    """
    if not routes or len(routes) < 2:
        return ["fastest", "eco", "alternate"]
    
    # Sort routes by emissions (eco first)
    eco_sorted = sorted(routes, key=lambda x: x["emissions"]["total_g"])
    
    # Sort routes by duration (fastest first)
    time_sorted = sorted(routes, key=lambda x: x["duration_hr"])
    
    # Create classification
    route_types = []
    
    # Eco route (lowest emissions)
    if eco_sorted:
        route_types.append("eco")
    
    # Fastest route (shortest time)
    if time_sorted and len(time_sorted) > 1:
        route_types.append("fastest")
    
    # Alternate route (remaining)
    if len(routes) > 2:
        route_types.append("alternate")
    
    # Fill remaining slots
    while len(route_types) < 3:
        route_types.append("alternate")
    
    return route_types[:3]