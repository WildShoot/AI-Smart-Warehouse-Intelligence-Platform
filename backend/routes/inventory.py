from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.mongodb import products_collection

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/inventory/summary", methods=["GET"])
@jwt_required()
def inventory_summary():
    admin_id = get_jwt_identity()

    products = list(products_collection.find({"admin_id": admin_id}))

    total_products = len(products)
    total_quantity = 0
    total_inventory_value = 0
    low_stock_products = []
    critical_stock_products = []

    for product in products:
        quantity = product.get("quantity", 0)
        price = product.get("price", 0)
        reorder_level = product.get("reorder_level", 0)

        total_quantity += quantity
        total_inventory_value += quantity * price

        if quantity <= reorder_level:
            low_stock_products.append({
                "product_name": product.get("product_name"),
                "sku": product.get("sku"),
                "quantity": quantity,
                "reorder_level": reorder_level
            })

        if quantity <= reorder_level * 0.5:
            critical_stock_products.append({
                "product_name": product.get("product_name"),
                "sku": product.get("sku"),
                "quantity": quantity,
                "reorder_level": reorder_level
            })

    return jsonify({
        "status": "success",
        "summary": {
            "total_products": total_products,
            "total_quantity": total_quantity,
            "total_inventory_value": total_inventory_value,
            "low_stock_count": len(low_stock_products),
            "critical_stock_count": len(critical_stock_products)
        },
        "low_stock_products": low_stock_products,
        "critical_stock_products": critical_stock_products
    }), 200
