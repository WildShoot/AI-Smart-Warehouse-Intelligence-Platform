import os
import sys
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

aliviya = db.admins.find_one({"email": "aliviyabose261105@gmail.com"})
if not aliviya:
    print("Aliviya not found in Atlas!")
    sys.exit(1)

aliviya_id = str(aliviya["_id"])
print(f"Aliviya's Atlas ID: {aliviya_id}")

aliviya_items = [
    {"admin_id": aliviya_id, "product_name": "iPhone 16 Pro Max 256GB", "category": "Electronics", "sku": "IPH-16PM", "price": 134999.0, "quantity": 14, "reorder_level": 20},
    {"admin_id": aliviya_id, "product_name": "Dell UltraSharp 32-inch 4K Monitor", "category": "Electronics", "sku": "DEL-U32-4K", "price": 72500.0, "quantity": 4, "reorder_level": 10},
    {"admin_id": aliviya_id, "product_name": "Bose QuietComfort Ultra Headphones", "category": "Electronics", "sku": "BOS-QCU", "price": 34900.0, "quantity": 28, "reorder_level": 15},
    {"admin_id": aliviya_id, "product_name": "Anker Prime 20000mAh Power Bank", "category": "Accessories", "sku": "ANK-PB-20K", "price": 8999.0, "quantity": 55, "reorder_level": 25},
    {"admin_id": aliviya_id, "product_name": "Keychron Q1 Pro Mechanical Keyboard", "category": "Accessories", "sku": "KEY-Q1-PRO", "price": 16999.0, "quantity": 2, "reorder_level": 8},
    {"admin_id": aliviya_id, "product_name": "Ergonomic Mesh Office Chair Pro", "category": "Furniture", "sku": "FUR-CH-ERG", "price": 22500.0, "quantity": 18, "reorder_level": 12},
    {"admin_id": aliviya_id, "product_name": "Motorized Dual-Motor Standing Desk", "category": "Furniture", "sku": "FUR-DSK-MOT", "price": 36000.0, "quantity": 5, "reorder_level": 10},
    {"admin_id": aliviya_id, "product_name": "Industrial Thermal Label Printer 300DPI", "category": "Industrial Equipment", "sku": "PRN-IND-300", "price": 28900.0, "quantity": 0, "reorder_level": 6},
    {"admin_id": aliviya_id, "product_name": "Digital Warehouse Platform Scale 500kg", "category": "Industrial Equipment", "sku": "SCL-WHS-500", "price": 19500.0, "quantity": 7, "reorder_level": 8},
    {"admin_id": aliviya_id, "product_name": "Manual Scissor Lift Table 350kg", "category": "Industrial Equipment", "sku": "LFT-SCS-350", "price": 42000.0, "quantity": 3, "reorder_level": 5},
    {"admin_id": aliviya_id, "product_name": "Anti-Fatigue Industrial Floor Matting 10m", "category": "Safety & Facilities", "sku": "MAT-IND-10M", "price": 8500.0, "quantity": 15, "reorder_level": 10},
    {"admin_id": aliviya_id, "product_name": "High-Visibility Safety Vests (Pack of 20)", "category": "Safety & Facilities", "sku": "SAF-VST-20P", "price": 2400.0, "quantity": 80, "reorder_level": 30},
    {"admin_id": aliviya_id, "product_name": "Heavy Duty Steel Strapping Kit 19mm", "category": "Packaging & Shipping", "sku": "PKG-STP-19", "price": 6800.0, "quantity": 32, "reorder_level": 15},
    {"admin_id": aliviya_id, "product_name": "Biodegradable Air Pillow Cushions (Roll)", "category": "Packaging & Shipping", "sku": "PKG-AIR-BIO", "price": 3200.0, "quantity": 110, "reorder_level": 40},
    {"admin_id": aliviya_id, "product_name": "Reinforced Water-Activated Kraft Tape", "category": "Packaging & Shipping", "sku": "PKG-KRF-WAT", "price": 1150.0, "quantity": 250, "reorder_level": 60},
    {"admin_id": aliviya_id, "product_name": "Commercial Dehumidifier 50L/Day", "category": "Safety & Facilities", "sku": "FAC-DHM-50L", "price": 48000.0, "quantity": 2, "reorder_level": 4},
    {"admin_id": aliviya_id, "product_name": "Honeywell Orbit Omnidirectional Scanner", "category": "Industrial Equipment", "sku": "SCN-HON-ORB", "price": 14200.0, "quantity": 12, "reorder_level": 15},
    {"admin_id": aliviya_id, "product_name": "Foldable Warehouse Platform Hand Truck", "category": "Industrial Equipment", "sku": "TRK-PLT-300", "price": 7800.0, "quantity": 22, "reorder_level": 12},
    {"admin_id": aliviya_id, "product_name": "ESD Safe Static Dissipative Gloves (x50)", "category": "Safety & Facilities", "sku": "SAF-GLV-ESD", "price": 1850.0, "quantity": 65, "reorder_level": 25},
    {"admin_id": aliviya_id, "product_name": "Heavy Duty Impact Corner Guards (x10)", "category": "Safety & Facilities", "sku": "FAC-CRN-10P", "price": 4500.0, "quantity": 40, "reorder_level": 20}
]

# Insert or update in Atlas
for item in aliviya_items:
    db.products.update_one(
        {"sku": item["sku"], "admin_id": aliviya_id},
        {"$set": item},
        upsert=True
    )

print(f"Successfully added {len(aliviya_items)} products for Aliviya in MongoDB Atlas!")

# Also sync local warehouse_data.json
json_path = os.path.join(current_dir, "warehouse_data.json")
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        local_data = json.load(f)

    for item in aliviya_items:
        exists = False
        for p in local_data.get("products", []):
            if p.get("sku") == item["sku"] and p.get("admin_id") == aliviya_id:
                p.update(item)
                exists = True
                break
        if not exists:
            local_data["products"].append(item)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(local_data, f, indent=2)

total_aliviya = db.products.count_documents({"admin_id": aliviya_id})
print(f"Total products in Atlas belonging to Aliviya: {total_aliviya}")
for p in db.products.find({"admin_id": aliviya_id}):
    print(f" - {p.get('product_name')} | SKU: {p.get('sku')} | Qty: {p.get('quantity')}")
