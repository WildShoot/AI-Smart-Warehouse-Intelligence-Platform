from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def admin_required(fn):
    """
    Decorator to verify that a valid JWT token is present in the request
    and identifies an authenticated administrator.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_admin = get_jwt_identity()
            if not current_admin:
                return jsonify({
                    "status": "error",
                    "message": "Authentication required. Please log in."
                }), 401
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Unauthorized: {str(e)}"
            }), 401
        return fn(*args, **kwargs)
    return wrapper
