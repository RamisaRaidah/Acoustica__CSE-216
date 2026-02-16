from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import logging
import sys

from user_service.services import users

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

users_bp = Blueprint("users", __name__) 

@users_bp.get("/api/users/health")
def health():
    return jsonify("users")

@users_bp.get("/api/users/me")
@jwt_required()
def get_me():
    identity=get_jwt_identity()
    claims=get_jwt()
    user_type=claims["user_type"]
    return jsonify({"user_id":identity, "user_type":user_type})

@users_bp.put("/api/users/me")
def update_account_route():
    return jsonify("update_account")

@users_bp.delete("/api/users/me")
def delete_account_route():
    return jsonify("delete_account")

@users_bp.get("/api/users")
def get_user_list_route():
    return jsonify("get_user_list")

@users_bp.get("/api/users/<user_id>")
def get_user_account_route(user_id):
    return jsonify(f"get_user_account {user_id}")

@users_bp.get("/api/users/<user_id>/profile")
def get_user_profile_route(user_id):
    return jsonify(f"get_user_profile {user_id}")

@users_bp.patch("/api/users/me/settings/app-mode")
def set_app_mode_route():
    return jsonify("set_app_mode")

@users_bp.patch("/api/users/me/settings/play-mode")
def set_play_mode_route():
    return jsonify("set_play_mode")

@users_bp.post("/api/users/<user_id>/notifications")
def add_notification_route(user_id):
    return jsonify(f"add_notification {user_id}")

@users_bp.get("/api/users/me/notifications")
def get_notifications_route():
    return jsonify("get_notifications")

@users_bp.post("/api/users/badges")
def add_badge_route():
    return jsonify("add_badge")

@users_bp.get("/api/users/badges")
def get_badges_route():
    return jsonify("get_badges")

@users_bp.post("/api/users/<user_id>/badges")
def add_user_badge_route(user_id):
    return jsonify(f"add_user_badge {user_id}")

@users_bp.get("/api/users/<user_id>/badges")
def get_user_badges_route(user_id):
    return jsonify(f"get_user_badges {user_id}")