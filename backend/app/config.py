import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables"""
    
    # Database
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://ecoroute_user:ecoroute_pass@localhost:5432/ecoroute_db"
    )
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "fallback-secret-key-change-this")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # External APIs (we'll add these later)
    openweather_api_key: Optional[str] = os.getenv("OPENWEATHER_API_KEY")
    openroute_api_key: Optional[str] = os.getenv("OPENROUTE_API_KEY")
    
    # App Settings
    app_name: str = "EcoRoute AI"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"

# Create global settings instance
settings = Settings()

# Print debug info
if settings.debug:
    print(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    print(f"📊 Database: {settings.database_url.split('@')[1] if '@' in settings.database_url else 'Unknown'}")