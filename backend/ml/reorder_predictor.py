def predict_reorder(product):

    quantity = product.get("quantity", 0)
    reorder_level = product.get("reorder_level", 0)

    product_name = product.get("product_name", "Unknown")
    sku = product.get("sku", "N/A")

    # Calculate stock health
    if reorder_level > 0:
        stock_ratio = quantity / reorder_level
    else:
        stock_ratio = 1

    # Determine risk level and priority

    if quantity == 0:

        risk_level = "CRITICAL"
        priority = "URGENT"
        reorder_required = True
        recommended_action = "Immediate reorder required"

    elif quantity < reorder_level:

        risk_level = "HIGH"
        priority = "HIGH"
        reorder_required = True
        recommended_action = "Reorder soon"

    elif quantity <= reorder_level * 1.5:

        risk_level = "MEDIUM"
        priority = "MEDIUM"
        reorder_required = False
        recommended_action = "Monitor stock level"

    else:

        risk_level = "LOW"
        priority = "LOW"
        reorder_required = False
        recommended_action = "Stock level is healthy"

    # Recommended reorder quantity
    recommended_quantity = max(
        (reorder_level * 3) - quantity,
        0
    )

    # Stock health score
    health_score = min(
        round(stock_ratio * 50, 2),
        100
    )

    return {

        "product_name": product_name,

        "sku": sku,

        "current_quantity": quantity,

        "reorder_level": reorder_level,

        "stock_health_score": health_score,

        "risk_level": risk_level,

        "priority": priority,

        "reorder_required": reorder_required,

        "recommended_reorder_quantity": recommended_quantity,

        "recommended_action": recommended_action

    }