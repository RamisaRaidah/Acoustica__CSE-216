from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
import logging
import sys

from analytics_service.services import admin_analytics

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

admin_analytics_bp = Blueprint("admin_analytics", __name__)

@admin_analytics_bp.get("/api/admin/analytics/dashboard")
@jwt_required()
def get_admin_dashboard_route():
    claims = get_jwt()
    if claims.get("user_type") != "admin":
        logging.warning("Unauthorized access attempt to admin analytics")
        return jsonify({"error": "Admin access required"}), 403
        
    logging.info("Admin analytics requested")
    result, status = admin_analytics.get_admin_dashboard_data()
    return jsonify(result), status
