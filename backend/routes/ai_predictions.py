from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.mongodb import db
from ml.reorder_predictor import predict_reorder

ai_bp = Blueprint("ai_bp", __name__)

@ai_bp.route("/reorder-predictions", methods=["GET"])
@jwt_required()
def reorder_predictions():
    try:
        admin_id = get_jwt_identity()

        products = list(
            db.products.find({"admin_id": admin_id}, {"_id": 0})
        )

        predictions = []
        critical_count = 0
        high_risk_count = 0
        reorder_required_count = 0

        for product in products:
            prediction = predict_reorder(product)
            predictions.append(prediction)

            if prediction["risk_level"] == "CRITICAL":
                critical_count += 1
            if prediction["risk_level"] == "HIGH":
                high_risk_count += 1
            if prediction["reorder_required"]:
                reorder_required_count += 1

        return jsonify({
            "status": "success",
            "summary": {
                "total_products_analyzed": len(products),
                "critical_products": critical_count,
                "high_risk_products": high_risk_count,
                "products_requiring_reorder": reorder_required_count
            },
            "predictions": predictions
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
