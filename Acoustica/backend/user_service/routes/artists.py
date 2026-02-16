from flask import Blueprint, jsonify
import logging
import sys

from user_service.services import artists

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

artists_bp = Blueprint("artists", __name__)

@artists_bp.get("/api/artists/health")
def health():
    return jsonify("artists")

@artists_bp.get("/api/artists/me/dashboard")
def get_dashboard_route():
    return jsonify("get_dashboard")

@artists_bp.get("/api/artists/me")
def get_profile_route():
    return jsonify("get_profile")