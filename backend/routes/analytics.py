from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.mongodb import products_collection

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    try:
        admin_id = get_jwt_identity()

        products = list(
            products_collection.find({"admin_id": admin_id}, {"_id": 0})
        )

        total_products = len(products)
        total_quantity = sum(product.get("quantity", 0) for product in products)
        total_inventory_value = sum(
            product.get("quantity", 0) * product.get("price", 0)
            for product in products
        )

        low_stock_products = [
            product for product in products
            if product.get("quantity", 0) <= product.get("reorder_level", 0)
        ]
        low_stock_count = len(low_stock_products)

        warehouse_health_score = (
            max(0, round(100 - (low_stock_count / total_products * 100), 2))
            if total_products > 0 else 100
        )

        category_data = {}
        for product in products:
            category = product.get("category", "Unknown")
            if category not in category_data:
                category_data[category] = {
                    "category": category,
                    "total_products": 0,
                    "total_quantity": 0,
                    "total_value": 0
                }
            category_data[category]["total_products"] += 1
            category_data[category]["total_quantity"] += product.get("quantity", 0)
            category_data[category]["total_value"] += (
                product.get("quantity", 0) * product.get("price", 0)
            )

        top_valuable_products = sorted(
            [
                {
                    "product_name": product.get("product_name"),
                    "sku": product.get("sku"),
                    "inventory_value": product.get("quantity", 0) * product.get("price", 0)
                }
                for product in products
            ],
            key=lambda x: x["inventory_value"],
            reverse=True
        )

        return jsonify({
            "status": "success",
            "overview": {
                "total_products": total_products,
                "total_quantity": total_quantity,
                "total_inventory_value": total_inventory_value,
                "low_stock_count": low_stock_count,
                "warehouse_health_score": warehouse_health_score
            },
            "category_analysis": list(category_data.values()),
            "top_valuable_products": top_valuable_products
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
