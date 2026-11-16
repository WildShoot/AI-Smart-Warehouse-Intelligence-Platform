import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

deepmalya = db.admins.find_one({"email": "deepmalya.football@gmail.com"})
if not deepmalya:
    print("Deepmalya not found!")
    sys.exit(1)

deep_id = str(deepmalya["_id"])
print(f"Deepmalya's Atlas ID is: {deep_id}")

# Update all products in Atlas to belong to Deepmalya
res = db.products.update_many(
    {"$or": [
        {"admin_id": None},
        {"admin_id": {"$exists": False}},
        {"admin_id": "6afaf3a9df9d133a0b1f1bc4"}
    ]},
    {"$set": {"admin_id": deep_id}}
)

print(f"Successfully linked {res.modified_count} products to Deepmalya!")

# Verify count
count = db.products.count_documents({"admin_id": deep_id})
print(f"Total products now visible to Deepmalya: {count}")
for p in db.products.find({"admin_id": deep_id}):
    print(f" - {p.get('product_name')} (SKU: {p.get('sku')}, Qty: {p.get('quantity')})")
