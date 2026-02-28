from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask import Blueprint, request, jsonify
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
def get_my_profile_route():
    logging.info('Hello to my own profile')
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_type = claims["user_type"]
    result, status = users.get_my_profile(user_id, user_type)
    return jsonify(result), status

@users_bp.post("/api/users/me/onboarding")
@jwt_required()
def onboarding_route():
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_type = claims["user_type"]
    data = {**request.form, 'pfp': request.files.get('pfp')}

    return users.onboarding(user_id, user_type, data)

@users_bp.get('/api/users/me/pfp')
@jwt_required()
def get_pfp():
    user_id = get_jwt_identity()
    result, status = users.get_profile_picture(user_id)
    return jsonify(result), status

@users_bp.put("/api/users/me")
@jwt_required()
def update_account_route():
    return jsonify("update_account")

@users_bp.delete("/api/users/me")
@jwt_required()
def delete_account_route():
    return jsonify("delete_account")

@users_bp.get("/api/users")
@jwt_required()
def get_user_list_route():
    return jsonify("get_user_list")

@users_bp.get("/api/users/<user_id>")
@jwt_required()
def get_user_account_route(user_id):
    return jsonify(f"get_user_account {user_id}")

@users_bp.get("/api/users/<user_id>/profile")
@jwt_required()
def get_user_profile_route(user_id):
    return jsonify(f"get_user_profile {user_id}")

@users_bp.patch("/api/users/me/settings/theme")
@jwt_required()
def set_theme_route():
    theme = request.json.get("theme")
    result, status = users.set_theme(theme)
    return jsonify(result), status

@users_bp.patch("/api/users/me/settings/play-mode")
@jwt_required()
def set_play_mode_route():
    return jsonify("set_play_mode")

@users_bp.post("/api/users/<user_id>/notifications")
@jwt_required()
def add_notification_route(user_id):
    return jsonify(f"add_notification {user_id}")

@users_bp.get("/api/users/me/notifications")
@jwt_required()
def get_notifications_route():
    return jsonify("get_notifications")

@users_bp.post("/api/users/badges")
@jwt_required()
def add_badge_route():
    return jsonify("add_badge")

@users_bp.get("/api/users/badges")
@jwt_required()
def get_badges_route():
    return jsonify("get_badges")

@users_bp.post("/api/users/<user_id>/badges")
@jwt_required()
def add_user_badge_route(user_id):
    return jsonify(f"add_user_badge {user_id}")

@users_bp.get("/api/users/<user_id>/badges")
@jwt_required()
def get_user_badges_route(user_id):
    return jsonify(f"get_user_badges {user_id}")

