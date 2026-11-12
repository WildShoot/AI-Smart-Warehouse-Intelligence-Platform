from routes.auth import auth_bp
from routes.products import product_bp
from routes.inventory import inventory_bp
from routes.analytics import analytics_bp
from routes.ai_predictions import ai_bp

__all__ = [
    "auth_bp",
    "product_bp",
    "inventory_bp",
    "analytics_bp",
    "ai_bp"
]
