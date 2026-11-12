from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from routes.products import product_bp
from routes.inventory import inventory_bp
from routes.analytics import analytics_bp
from routes.ai_predictions import ai_bp
from routes.auth import auth_bp


app = Flask(__name__)


# =========================
# CORS Configuration
# =========================

CORS(app)


# =========================
# JWT Configuration
# =========================

app.config["JWT_SECRET_KEY"] = "smart_warehouse_super_secret_key_2026"


# Initialize JWT

jwt = JWTManager(app)


# =========================
# Register Blueprints
# =========================

# Product Routes
app.register_blueprint(
    product_bp,
    url_prefix="/api"
)


# Inventory Routes
app.register_blueprint(
    inventory_bp,
    url_prefix="/api"
)


# Analytics Routes
app.register_blueprint(
    analytics_bp,
    url_prefix="/api/analytics"
)


# AI Prediction Routes
app.register_blueprint(
    ai_bp,
    url_prefix="/api/ai"
)


# Authentication Routes
app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)


# =========================
# Home Route
# =========================

@app.route("/")
def home():

    return {
        "status": "success",
        "message": "AI Smart Warehouse Intelligence Platform API is running"
    }


# =========================
# Run Application
# =========================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )