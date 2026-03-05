from flask import Blueprint, jsonify
import logging
import sys
from flask_jwt_extended import jwt_required

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
@jwt_required()
def get_dashboard_route():
    return jsonify("get_dashboard")

@artists_bp.get("/api/artists/me")
@jwt_required()
def get_profile_route():
    return jsonify("get_profile")

@artists_bp.get("/api/artists")
@jwt_required()
def get_artists_route():
    result, status = artists.get_artists()
    return jsonify(result), status