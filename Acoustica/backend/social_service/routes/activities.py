from flask import Blueprint, jsonify
import logging
import sys

from social_service.services import activities

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

activities_bp = Blueprint("activities", __name__) 

@activities_bp.get("/api/activities/health")
def health():
    return jsonify("activities")

@activities_bp.post("/api/activities/email")
def send_email_route():
    return jsonify("send_email")

@activities_bp.get("/api/activities/cheer")
def cheer_route():
    return jsonify("cheer")

@activities_bp.delete("/api/assets/<asset_id>")
def ban_asset_route(asset_id):
    return jsonify(f"ban_asset {asset_id}")