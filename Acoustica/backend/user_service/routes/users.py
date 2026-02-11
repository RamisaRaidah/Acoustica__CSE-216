from flask import Blueprint, jsonify
import logging

from user_service.services import users

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

users_bp = Blueprint("users", __name__) 

@users_bp.get("/api/users/health")
def health():
    return jsonify("users")

@users_bp.put("/api/users/me")
def update_account():
    return jsonify("update_account")

@users_bp.delete("/api/users/me")
def delete_account():
    return jsonify("delete_account")

@users_bp.get("/api/users")
def get_user_list():
    return jsonify("get_user_list")

@users_bp.get("/api/users/<user_id>")
def get_user_account(user_id):
    return jsonify(f"get_user_account {user_id}")

@users_bp.get("/api/users/<user_id>/profile")
def get_user_profile(user_id):
    return jsonify(f"get_user_profile {user_id}")

@users_bp.patch("/api/users/me/settings/app-mode")
def set_app_mode():
    return jsonify("set_app_mode")

@users_bp.patch("/api/users/me/settings/play-mode")
def set_play_mode():
    return jsonify("set_play_mode")

@users_bp.post("/api/users/<user_id>/notifications")
def add_notification(user_id):
    return jsonify(f"add_notification {user_id}")

@users_bp.get("/api/users/me/notifications")
def get_notifications():
    return jsonify("get_notifications")

@users_bp.post("/api/users/badges")
def add_badge():
    return jsonify("add_badge")

@users_bp.get("/api/users/badges")
def get_badges():
    return jsonify("get_badges")

@users_bp.post("/api/users/<user_id>/badges")
def add_user_badge(user_id):
    return jsonify(f"add_user_badge {user_id}")

@users_bp.get("/api/users/<user_id>/badges")
def get_user_badges(user_id):
    return jsonify(f"get_user_badges {user_id}")