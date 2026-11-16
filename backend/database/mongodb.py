import os
import json
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from bson import ObjectId
from config import MONGO_URI, DATABASE_NAME

DB_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "warehouse_data.json")

class AutoSavingCollection:
    def __init__(self, collection, save_callback):
        self._col = collection
        self._save = save_callback

    def insert_one(self, *args, **kwargs):
        res = self._col.insert_one(*args, **kwargs)
        self._save()
        return res

    def insert_many(self, *args, **kwargs):
        res = self._col.insert_many(*args, **kwargs)
        self._save()
        return res

    def update_one(self, *args, **kwargs):
        res = self._col.update_one(*args, **kwargs)
        self._save()
        return res

    def delete_one(self, *args, **kwargs):
        res = self._col.delete_one(*args, **kwargs)
        self._save()
        return res

    def __getattr__(self, name):
        return getattr(self._col, name)

class PersistentDatabaseProxy:
    def __init__(self, db, file_path):
        self._db = db
        self._file_path = file_path
        self._collections = {}

    def _save(self):
        try:
            data = {}
            for col_name in ["admins", "products", "inventory", "sales", "movements"]:
                docs = list(self._db[col_name].find())
                serialized = []
                for d in docs:
                    d_copy = dict(d)
                    if "_id" in d_copy:
                        d_copy["_id"] = str(d_copy["_id"])
                    serialized.append(d_copy)
                data[col_name] = serialized
            with open(self._file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print("Error persisting warehouse data to file:", e)

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = AutoSavingCollection(self._db[name], self._save)
        return self._collections[name]

    def __getattr__(self, name):
        return self[name]

def seed_initial_data(database):
    """Seed sample warehouse products only for the default Deepmalya admin account."""
    deepmalya_id = None
    existing_admin = database.admins.find_one({"email": "deepmalya.football@gmail.com"})

    if not existing_admin:
        demo_admin = {
            "name": "Deepmalya Ghosh Dastider",
            "email": "deepmalya.football@gmail.com",
            "password": generate_password_hash("admin123"),
            "role": "admin"
        }
        res = database.admins.insert_one(demo_admin)
        deepmalya_id = str(res.inserted_id)
        print("Default administrator seeded: deepmalya.football@gmail.com (pwd: admin123)")
    else:
        deepmalya_id = str(existing_admin["_id"])

    # Seed demo products only if no products exist yet
    if database.products.count_documents({}) == 0 and deepmalya_id:
        demo_products = [
            {
                "admin_id": deepmalya_id,
                "product_name": "MacBook Pro M3 Max 16-inch",
                "category": "Electronics",
                "sku": "MBP-M3-16",
                "price": 249999.0,
                "quantity": 6,
                "reorder_level": 15
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Samsung 49-inch Curved Gaming Monitor",
                "category": "Electronics",
                "sku": "MON-SM-49",
                "price": 89999.0,
                "quantity": 2,
                "reorder_level": 10
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Sony WH-1000XM5 Noise Canceling",
                "category": "Electronics",
                "sku": "AUD-SNY-XM5",
                "price": 27999.0,
                "quantity": 38,
                "reorder_level": 15
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Logitech MX Master 3S Wireless",
                "category": "Accessories",
                "sku": "ACC-LOG-MX3",
                "price": 9499.0,
                "quantity": 65,
                "reorder_level": 20
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Heavy Duty Hydraulic Pallet Jack 3-Ton",
                "category": "Industrial Equipment",
                "sku": "EQP-PLT-3000",
                "price": 38500.0,
                "quantity": 3,
                "reorder_level": 6
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Zebra Industrial 2D Barcode Scanner",
                "category": "Industrial Equipment",
                "sku": "SCN-ZBR-2D",
                "price": 16500.0,
                "quantity": 0,
                "reorder_level": 12
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Automated Guided Vehicle Lidar Sensor",
                "category": "Robotics & Automation",
                "sku": "ROB-AGV-LIDAR",
                "price": 62000.0,
                "quantity": 5,
                "reorder_level": 8
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Heavy Duty Corrugated Storage Crates (x50)",
                "category": "Packaging & Storage",
                "sku": "PKG-CRT-50",
                "price": 4200.0,
                "quantity": 140,
                "reorder_level": 40
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Direct Thermal Shipping Labels 4x6 Roll",
                "category": "Packaging & Storage",
                "sku": "PKG-LBL-4X6",
                "price": 950.0,
                "quantity": 220,
                "reorder_level": 50
            },
            {
                "admin_id": deepmalya_id,
                "product_name": "Industrial High-Tack Stretch Film 500m",
                "category": "Packaging & Storage",
                "sku": "PKG-STF-500",
                "price": 1450.0,
                "quantity": 18,
                "reorder_level": 35
            }
        ]
        database.products.insert_many(demo_products)
        print("Seeded demo products for Deepmalya.")

# Attempt connection to MongoDB Atlas, with resilient fallback
connected = False
db = None

if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
        client.admin.command("ping")
        db = client[DATABASE_NAME or "smart_warehouse"]
        connected = True
        print("Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"Notice: MongoDB Atlas unavailable ({e}). Using persistent local store...")

if not connected:
    import mongomock
    raw_mock_client = mongomock.MongoClient()
    raw_mock_db = raw_mock_client[DATABASE_NAME or "smart_warehouse"]

    # Load persistent data from disk if it exists
    if os.path.exists(DB_FILE_PATH):
        try:
            with open(DB_FILE_PATH, "r", encoding="utf-8") as f:
                saved_data = json.load(f)
            for col_name, docs in saved_data.items():
                col = raw_mock_db[col_name]
                for d in docs:
                    if "_id" in d and isinstance(d["_id"], str):
                        d["_id"] = ObjectId(d["_id"])
                    col.insert_one(d)
            print("Loaded persistent warehouse data from disk!")
        except Exception as e:
            print("Error loading stored data from disk:", e)

    db = PersistentDatabaseProxy(raw_mock_db, DB_FILE_PATH)
    seed_initial_data(db)

# Map collections
products_collection = db["products"]
inventory_collection = db["inventory"]
sales_collection = db["sales"]
movements_collection = db["movements"]
