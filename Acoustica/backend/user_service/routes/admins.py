from flask import Blueprint, jsonify
import logging

from user_service.services import admins

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

admins_bp = Blueprint("admins", __name__) 

@admins_bp.get("/api/admins/health")
def health():
    return jsonify("admins")

@admins_bp.get("/api/admins/me/dashboard")
def get_dashboard_route():
    return jsonify("get_dashboard")

@admins_bp.get("/api/admins/me")
def get_profile_route():
    return jsonify("get_profile")