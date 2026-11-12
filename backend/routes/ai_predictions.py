from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from database.mongodb import db
from ml.reorder_predictor import predict_reorder


ai_bp = Blueprint("ai_bp", __name__)


# =====================================
# AI REORDER PREDICTIONS
# =====================================

@ai_bp.route("/reorder-predictions", methods=["GET"])
@jwt_required()
def reorder_predictions():

    try:

        products = list(
            db.products.find({}, {"_id": 0})
        )

        predictions = []

        critical_count = 0
        high_risk_count = 0
        reorder_required_count = 0


        # Analyze every product
        for product in products:

            prediction = predict_reorder(product)

            predictions.append(prediction)


            # Count critical products
            if prediction["risk_level"] == "CRITICAL":

                critical_count += 1


            # Count high-risk products
            if prediction["risk_level"] == "HIGH":

                high_risk_count += 1


            # Count products requiring reorder
            if prediction["reorder_required"]:

                reorder_required_count += 1


        # Return AI prediction results
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