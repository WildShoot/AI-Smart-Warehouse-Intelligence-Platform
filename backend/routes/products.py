from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.mongodb import db

product_bp = Blueprint("products", __name__)

# =====================================
# ADD PRODUCT
# =====================================
@product_bp.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    admin_id = get_jwt_identity()
    data = request.get_json()

    required_fields = [
        "product_name",
        "category",
        "sku",
        "price",
        "quantity",
        "reorder_level"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    existing_product = db.products.find_one({
        "sku": data["sku"],
        "admin_id": admin_id
    })

    if existing_product:
        return jsonify({
            "status": "error",
            "message": "Product with this SKU already exists in your inventory"
        }), 409

    product = {
        "admin_id": admin_id,
        "product_name": data["product_name"],
        "category": data["category"],
        "sku": data["sku"],
        "price": float(data["price"]),
        "quantity": int(data["quantity"]),
        "reorder_level": int(data["reorder_level"])
    }

    result = db.products.insert_one(product)

    return jsonify({
        "status": "success",
        "message": "Product added successfully",
        "product_id": str(result.inserted_id)
    }), 201


# =====================================
# GET ALL PRODUCTS
# =====================================
@product_bp.route("/products", methods=["GET"])
@jwt_required()
def get_products():
    admin_id = get_jwt_identity()
    products = []

    for product in db.products.find({"admin_id": admin_id}):
        product["_id"] = str(product["_id"])
        products.append(product)

    return jsonify({
        "status": "success",
        "total_products": len(products),
        "products": products
    }), 200


# =====================================
# GET SINGLE PRODUCT
# =====================================
@product_bp.route("/products/<sku>", methods=["GET"])
@jwt_required()
def get_product(sku):
    admin_id = get_jwt_identity()
    product = db.products.find_one({
        "sku": sku,
        "admin_id": admin_id
    })

    if not product:
        return jsonify({
            "status": "error",
            "message": "Product not found"
        }), 404

    product["_id"] = str(product["_id"])

    return jsonify({
        "status": "success",
        "product": product
    }), 200


# =====================================
# UPDATE PRODUCT
# =====================================
@product_bp.route("/products/<sku>", methods=["PUT"])
@jwt_required()
def update_product(sku):
    admin_id = get_jwt_identity()
    data = request.get_json()

    product = db.products.find_one({
        "sku": sku,
        "admin_id": admin_id
    })

    if not product:
        return jsonify({
            "status": "error",
            "message": "Product not found"
        }), 404

    update_data = {}
    allowed_fields = [
        "product_name",
        "category",
        "price",
        "quantity",
        "reorder_level"
    ]

    for field in allowed_fields:
        if field in data:
            if field == "price":
                update_data[field] = float(data[field])
            elif field in ["quantity", "reorder_level"]:
                update_data[field] = int(data[field])
            else:
                update_data[field] = data[field]

    if not update_data:
        return jsonify({
            "status": "error",
            "message": "No valid fields provided for update"
        }), 400

    db.products.update_one(
        {"sku": sku, "admin_id": admin_id},
        {"$set": update_data}
    )

    return jsonify({
        "status": "success",
        "message": "Product updated successfully"
    }), 200


# =====================================
# DELETE PRODUCT
# =====================================
@product_bp.route("/products/<sku>", methods=["DELETE"])
@jwt_required()
def delete_product(sku):
    admin_id = get_jwt_identity()

    result = db.products.delete_one({
        "sku": sku,
        "admin_id": admin_id
    })

    if result.deleted_count == 0:
        return jsonify({
            "status": "error",
            "message": "Product not found"
        }), 404

    return jsonify({
        "status": "success",
        "message": "Product deleted successfully"
    }), 200
