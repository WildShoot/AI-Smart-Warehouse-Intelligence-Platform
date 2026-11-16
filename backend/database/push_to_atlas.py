import os
import sys

# Ensure backend root is on path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import json
from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME

print("Connecting to MongoDB Atlas...")
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

print("Atlas Ping Response:", db.command("ping"))

json_path = os.path.join(current_dir, "warehouse_data.json")
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Upload Admins
print("\n--- Uploading Admins to Atlas ---")
for admin in data.get("admins", []):
    admin_doc = dict(admin)
    email = admin_doc.pop("email")
    admin_doc.pop("_id", None)
    db.admins.update_one({"email": email}, {"$set": admin_doc}, upsert=True)
    print(f"Uploaded: {admin['name']} ({email})")

# Upload Products
print("\n--- Uploading Products to Atlas ---")
for prod in data.get("products", []):
    prod_doc = dict(prod)
    sku = prod_doc.pop("sku")
    prod_doc.pop("_id", None)
    db.products.update_one({"sku": sku}, {"$set": prod_doc}, upsert=True)

print("\n--- VERIFICATION IN MONGODB ATLAS CLOUD ---")
for a in db.admins.find():
    print(f"User in Atlas: {a.get('name')} | Email: {a.get('email')}")

print(f"Total Products in Atlas: {db.products.count_documents({})}")
print("\nSUCCESS! Everything is now live in MongoDB Atlas!")
