from flask import Blueprint, jsonify
import logging

from social_service.services import activities

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

activities_bp = Blueprint("activities", __name__) 

@activities_bp.get("/api/activities/health")
def health():
    return jsonify("activities")

@activities_bp.post("/api/activities/email")
def send_email():
    return jsonify("send_email")

@activities_bp.get("/api/activities/cheer")
def cheer():
    return jsonify("cheer")

@activities_bp.delete("/api/assets/<asset_id>")
def ban_asset(asset_id):
    return jsonify(f"ban_asset {asset_id}")