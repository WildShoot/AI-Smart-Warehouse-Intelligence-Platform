import os
import sys
import json

# Add backend directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(os.path.dirname(current_dir), "backend")
sys.path.append(backend_dir)

from database.mongodb import db, products_collection

def seed_dataset():
    json_path = os.path.join(current_dir, "warehouse_products.json")
    if not os.path.exists(json_path):
        print(f"Dataset file not found: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        products = json.load(f)

    inserted = 0
    updated = 0

    for prod in products:
        existing = products_collection.find_one({"sku": prod["sku"]})
        if not existing:
            products_collection.insert_one(prod)
            inserted += 1
        else:
            products_collection.update_one({"sku": prod["sku"]}, {"$set": prod})
            updated += 1

    print(f"Seeding complete! {inserted} products inserted, {updated} updated.")

if __name__ == "__main__":
    seed_dataset()
