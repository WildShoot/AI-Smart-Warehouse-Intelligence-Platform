import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from config import MONGO_URI, DATABASE_NAME

db = None
products_collection = None
inventory_collection = None
sales_collection = None
movements_collection = None

def seed_initial_data(database):
    """Seed sample warehouse products and admin account if collection is empty."""
    # Seed Admin if not exists
    if database.admins.count_documents({}) == 0:
        demo_admin = {
            "name": "Deepmalya Ghosh Dastider",
            "email": "deepmalya.football@gmail.com",
            "password": generate_password_hash("admin123"),
            "role": "admin"
        }
        database.admins.insert_one(demo_admin)
        print("Default administrator seeded: deepmalya.football@gmail.com (pwd: admin123)")

    # Seed Products if empty
    if database.products.count_documents({}) == 0:
        demo_products = [
            {
                "product_name": "MacBook Pro M3 Max 16-inch",
                "category": "Electronics",
                "sku": "MBP-M3-16",
                "price": 249999.0,
                "quantity": 6,
                "reorder_level": 15
            },
            {
                "product_name": "Samsung 49-inch Curved Gaming Monitor",
                "category": "Electronics",
                "sku": "MON-SM-49",
                "price": 89999.0,
                "quantity": 2,
                "reorder_level": 10
            },
            {
                "product_name": "Sony WH-1000XM5 Noise Canceling",
                "category": "Electronics",
                "sku": "AUD-SNY-XM5",
                "price": 27999.0,
                "quantity": 38,
                "reorder_level": 15
            },
            {
                "product_name": "Logitech MX Master 3S Wireless",
                "category": "Accessories",
                "sku": "ACC-LOG-MX3",
                "price": 9499.0,
                "quantity": 65,
                "reorder_level": 20
            },
            {
                "product_name": "Heavy Duty Hydraulic Pallet Jack 3-Ton",
                "category": "Industrial Equipment",
                "sku": "EQP-PLT-3000",
                "price": 38500.0,
                "quantity": 3,
                "reorder_level": 6
            },
            {
                "product_name": "Zebra Industrial 2D Barcode Scanner",
                "category": "Industrial Equipment",
                "sku": "SCN-ZBR-2D",
                "price": 16500.0,
                "quantity": 0,
                "reorder_level": 12
            },
            {
                "product_name": "Automated Guided Vehicle Lidar Sensor",
                "category": "Robotics & Automation",
                "sku": "ROB-AGV-LIDAR",
                "price": 62000.0,
                "quantity": 5,
                "reorder_level": 8
            },
            {
                "product_name": "Heavy Duty Corrugated Storage Crates (x50)",
                "category": "Packaging & Storage",
                "sku": "PKG-CRT-50",
                "price": 4200.0,
                "quantity": 140,
                "reorder_level": 40
            },
            {
                "product_name": "Direct Thermal Shipping Labels 4x6 Roll",
                "category": "Packaging & Storage",
                "sku": "PKG-LBL-4X6",
                "price": 950.0,
                "quantity": 220,
                "reorder_level": 50
            },
            {
                "product_name": "Industrial High-Tack Stretch Film 500m",
                "category": "Packaging & Storage",
                "sku": "PKG-STF-500",
                "price": 1450.0,
                "quantity": 18,
                "reorder_level": 35
            }
        ]
        database.products.insert_many(demo_products)
        print(f"Seeded {len(demo_products)} warehouse products for immediate analytics and predictions.")

# Initialize database connection
connected = False

if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500, connectTimeoutMS=2500)
        client.admin.command("ping")
        db = client[DATABASE_NAME]
        connected = True
        print("Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"Notice: MongoDB Atlas connection failed ({e}).")
        print("Switching seamlessly to high-speed local store for offline development...")

if not connected:
    try:
        import mongomock
        mock_client = mongomock.MongoClient()
        db = mock_client[DATABASE_NAME or "smart_warehouse"]
        print("Local warehouse database ready!")
        seed_initial_data(db)
    except Exception as e:
        print("Fallback mock initialization error:", e)
        raise

# Map standard collections
products_collection = db["products"]
inventory_collection = db["inventory"]
sales_collection = db["sales"]
movements_collection = db["movements"]
