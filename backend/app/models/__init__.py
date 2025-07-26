from .base import Base

# Only import models that exist
try:
    from .organization import Organization
except ImportError:
    pass

try:
    from .route import Route
except ImportError:
    pass

try:
    from .vehicle import Vehicle
except ImportError:
    pass

# Export what we have
__all__ = ["Base"]